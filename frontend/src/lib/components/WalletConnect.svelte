<script lang="ts">
import { WalletManager } from '$lib/wallet/linera-signer';
import { Wallet, LogOut, CheckCircle } from '@lucide/svelte';

let chainId = $state('');
let isConnected = $state(false);
let error = $state('');

const walletManager = WalletManager.getInstance();

function connect() {
	error = '';
	
	if (!chainId.trim()) {
		error = 'Please enter your chain ID';
		return;
	}

	try {
		walletManager.connect(chainId);
		isConnected = true;
		localStorage.setItem('linera_chain_id', chainId);
	} catch (e) {
		error = e instanceof Error ? e.message : 'Failed to connect wallet';
	}
}

function disconnect() {
	walletManager.disconnect();
	isConnected = false;
	chainId = '';
	localStorage.removeItem('linera_chain_id');
}

// Auto-reconnect on mount
$effect(() => {
	const savedChainId = localStorage.getItem('linera_chain_id');
	if (savedChainId) {
		chainId = savedChainId;
		try {
			walletManager.connect(savedChainId);
			isConnected = true;
		} catch (e) {
			console.error('Failed to reconnect wallet:', e);
		}
	}
});
</script>

<div class="wallet-connect">
	{#if isConnected}
		<div class="connected">
			<CheckCircle size={20} />
			<span class="chain-id">{chainId.slice(0, 8)}...{chainId.slice(-6)}</span>
			<button onclick={disconnect} class="disconnect-btn">
				<LogOut size={16} />
				Disconnect
			</button>
		</div>
	{:else}
		<div class="connect-form">
			<Wallet size={24} />
			<input
				type="text"
				bind:value={chainId}
				placeholder="Enter your Linera chain ID"
				class="chain-input"
			/>
			<button onclick={connect} class="connect-btn">Connect Wallet</button>
			{#if error}
				<p class="error">{error}</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.wallet-connect {
		padding: 1rem;
		background: #000;
		border: 2px solid #39ff14;
		border-radius: 9999px;
	}

	.connected {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: #39ff14;
	}

	.chain-id {
		font-family: monospace;
		font-size: 0.875rem;
	}

	.disconnect-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: transparent;
		border: 1px solid #39ff14;
		border-radius: 9999px;
		color: #39ff14;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.disconnect-btn:hover {
		background: #39ff14;
		color: #000;
	}

	.connect-form {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: #39ff14;
	}

	.chain-input {
		flex: 1;
		padding: 0.75rem 1rem;
		background: #000;
		border: 1px solid #39ff14;
		border-radius: 9999px;
		color: #39ff14;
		font-size: 0.875rem;
	}

	.chain-input::placeholder {
		color: #39ff1480;
	}

	.connect-btn {
		padding: 0.75rem 1.5rem;
		background: #39ff14;
		border: none;
		border-radius: 9999px;
		color: #000;
		font-weight: 600;
		cursor: pointer;
	}

	.connect-btn:hover {
		opacity: 0.9;
	}

	.error {
		color: #ff1439;
		font-size: 0.875rem;
		margin: 0;
	}
</style>
