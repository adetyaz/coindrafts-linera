import { writable, derived } from 'svelte/store';

export interface WalletState {
	chainId: string | null;
	isConnected: boolean;
	playerName: string | null;
}

const STORAGE_KEY = 'coindrafts_wallet';

// Initialize from localStorage
function getInitialState(): WalletState {
	if (typeof window === 'undefined') {
		return { chainId: null, isConnected: false, playerName: null };
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			return {
				chainId: parsed.chainId || null,
				isConnected: !!parsed.chainId,
				playerName: parsed.playerName || null
			};
		}
	} catch (error) {
		console.error('Failed to load wallet from localStorage:', error);
	}

	return { chainId: null, isConnected: false, playerName: null };
}

// Create the writable store
const walletStore = writable<WalletState>(getInitialState());

// Subscribe to changes and persist to localStorage
walletStore.subscribe((state) => {
	if (typeof window !== 'undefined') {
		try {
			if (state.chainId) {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
			} else {
				localStorage.removeItem(STORAGE_KEY);
			}
		} catch (error) {
			console.error('Failed to save wallet to localStorage:', error);
		}
	}
});

// Wallet actions
export const wallet = {
	subscribe: walletStore.subscribe,

	connect: (chainId: string, playerName?: string) => {
		walletStore.set({
			chainId,
			isConnected: true,
			playerName: playerName || null
		});
	},

	disconnect: () => {
		walletStore.set({
			chainId: null,
			isConnected: false,
			playerName: null
		});
	},

	updatePlayerName: (playerName: string) => {
		walletStore.update((state) => ({
			...state,
			playerName
		}));
	}
};

// Derived stores for convenience
export const isWalletConnected = derived(walletStore, ($wallet) => $wallet.isConnected);
export const connectedChainId = derived(walletStore, ($wallet) => $wallet.chainId);
export const playerName = derived(walletStore, ($wallet) => $wallet.playerName);

// Helper function to get current wallet state (non-reactive)
export function getWalletState(): WalletState {
	let state: WalletState = { chainId: null, isConnected: false, playerName: null };
	walletStore.subscribe((s) => (state = s))();
	return state;
}
