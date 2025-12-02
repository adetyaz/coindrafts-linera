import { browser } from '$app/environment';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum, polygon, base, optimism } from '@reown/appkit/networks';
import { watchAccount } from '@wagmi/core';
import { wallet } from './stores/wallet';

// Only initialize in browser environment
let appKit: ReturnType<typeof createAppKit> | undefined = undefined;
let wagmiAdapter: WagmiAdapter | undefined = undefined;

if (browser) {
	const projectId = '40e8880296bd6a3d501c9cf33f7dfc78';

	// Define supported networks
	const networks = [mainnet, arbitrum, polygon, base, optimism];

	// Create Wagmi adapter
	wagmiAdapter = new WagmiAdapter({
		networks,
		projectId
	});

	// Initialize AppKit
	appKit = createAppKit({
		adapters: [wagmiAdapter],
		networks: [arbitrum, mainnet],
		defaultNetwork: mainnet,
		projectId,
		metadata: {
			name: 'CoinDrafts',
			description: 'Draft crypto portfolios and compete for prizes',
			url: 'https://coindrafts.com',
			icons: ['https://avatars.githubusercontent.com/u/179229932']
		},
		features: {
			analytics: true,
			email: false,
			socials: []
		},
		themeMode: 'dark',
		themeVariables: {
			'--w3m-color-mix': '#000000',
			'--w3m-color-mix-strength': 100,
			'--w3m-accent': '#22c55e',
			'--w3m-border-radius-master': '8px',
			'--w3m-z-index': 1000
		}
	});

	// Sync AppKit wallet state to our wallet store
	if (wagmiAdapter.wagmiConfig) {
		watchAccount(wagmiAdapter.wagmiConfig, {
			onChange(account) {
				if (account.address && account.isConnected) {
					// User connected - use Ethereum address as playerAccount
					wallet.connect(account.address, account.address);
				} else {
					// User disconnected
					wallet.disconnect();
				}
			}
		});
	}
}

export { appKit, wagmiAdapter };
