import { writable, type Writable } from 'svelte/store';

export interface Todo {
	id: number;
	text: string;
	completed: boolean;
	createdAt: number;
}

export interface WalletState {
	connected: boolean;
	address: string | null;
	chainId: string | null;
}

export interface AppState {
	initialized: boolean;
	applicationId: string | null;
}

// Todo store using Svelte stores
export const todos: Writable<Todo[]> = writable([]);
export const loading: Writable<boolean> = writable(false);
export const error: Writable<string | null> = writable(null);

// Wallet connection store
export const wallet: Writable<WalletState> = writable({
	connected: false,
	address: null,
	chainId: null
});

// Application state
export const appState: Writable<AppState> = writable({
	initialized: false,
	applicationId: null
});
