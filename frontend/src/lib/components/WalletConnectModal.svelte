<script lang="ts">
	import { wallet } from '$lib/stores/wallet';
	import { showToast } from '$lib/stores/toasts';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen = $bindable(false), onClose }: Props = $props();

	// Use the default chain ID from deployment
	const DEFAULT_CHAIN = '3b7dc35ad9989e5a049084fe4b0a995905ab65bd98a60e89f9b3576fb2ce125e';
	
	let chainId = $state(DEFAULT_CHAIN);
	let playerName = $state('');
	let isConnecting = $state(false);
	let useCustomChain = $state(false);

	function handleConnect() {
		const finalChainId = useCustomChain ? chainId.trim() : DEFAULT_CHAIN;
		
		if (!finalChainId) {
			showToast('Chain ID is required', 'error');
			return;
		}

		isConnecting = true;

		try {
			wallet.connect(finalChainId, playerName.trim() || undefined);
			showToast('Connected successfully!', 'success');
			chainId = DEFAULT_CHAIN;
			playerName = '';
			useCustomChain = false;
			onClose();
		} catch (error) {
			showToast('Failed to connect', 'error');
		} finally {
			isConnecting = false;
		}
	}

	function handleClose() {
		if (!isConnecting) {
			chainId = DEFAULT_CHAIN;
			playerName = '';
			useCustomChain = false;
			onClose();
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		onclick={handleClose}
		role="presentation"
	>
		<div
			class="relative w-full max-w-md rounded-lg border bg-zinc-900 p-6 shadow-xl"
			style="border-color: #22c55e;"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
		>
			<h2 class="mb-4 text-2xl font-bold" style="color: #22c55e;">Connect to CoinDrafts</h2>

			<div class="space-y-4">
				<div class="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
					<p class="text-sm text-blue-300">
						🎮 You'll use the default Linera chain. Click Connect to start playing!
					</p>
				</div>

				<div>
					<label for="playerName" class="mb-2 block text-sm font-medium text-white">
						Player Name <span class="text-zinc-500">(optional)</span>
					</label>
					<input
						type="text"
						id="playerName"
						bind:value={playerName}
						placeholder="Enter your display name"
						class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none"
						style="focus:border-color: #22c55e;"
						disabled={isConnecting}
					/>
				</div>

				<div>
					<label class="flex items-center gap-2 text-sm text-zinc-400">
						<input
							type="checkbox"
							bind:checked={useCustomChain}
							class="rounded"
						/>
						Use custom chain ID (advanced)
					</label>
				</div>

				{#if useCustomChain}
					<div>
						<label for="chainId" class="mb-2 block text-sm font-medium text-white">
							Custom Chain ID
						</label>
						<input
							type="text"
							id="chainId"
							bind:value={chainId}
							placeholder="Enter your chain ID"
							class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none font-mono text-xs"
							disabled={isConnecting}
						/>
					</div>
				{/if}

				<div class="flex gap-3 pt-4">
					<button
						onclick={handleClose}
						disabled={isConnecting}
						class="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						onclick={handleConnect}
						disabled={isConnecting}
						class="flex-1 rounded-lg px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
						style="background-color: #22c55e;"
					>
						{isConnecting ? 'Connecting...' : 'Connect'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
