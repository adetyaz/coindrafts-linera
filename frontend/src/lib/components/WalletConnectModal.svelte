<script lang="ts">
	import { wallet } from '$lib/stores/wallet';
	import { showToast } from '$lib/stores/toasts';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen = $bindable(false), onClose }: Props = $props();

	let chainId = $state('');
	let playerName = $state('');
	let isConnecting = $state(false);

	function handleConnect() {
		if (!chainId.trim()) {
			showToast('Please enter your chain ID', 'error');
			return;
		}

		// Validate chain ID format (should be 66 characters)
		if (chainId.length !== 66) {
			showToast('Chain ID must be 66 characters', 'error');
			return;
		}

		isConnecting = true;

		try {
			wallet.connect(chainId.trim(), playerName.trim() || undefined);
			showToast('Wallet connected successfully!', 'success');
			chainId = '';
			playerName = '';
			onClose();
		} catch (error) {
			showToast('Failed to connect wallet', 'error');
		} finally {
			isConnecting = false;
		}
	}

	function handleClose() {
		if (!isConnecting) {
			chainId = '';
			playerName = '';
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
			class="relative w-full max-w-md rounded-lg border border-[#39ff14]/20 bg-zinc-900 p-6 shadow-xl"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
		>
			<h2 class="mb-4 text-2xl font-bold text-[#39ff14]">Connect Wallet</h2>

			<div class="space-y-4">
				<div>
					<label for="chainId" class="mb-2 block text-sm font-medium text-white">
						Chain ID <span class="text-[#39ff14]">*</span>
					</label>
					<input
						type="text"
						id="chainId"
						bind:value={chainId}
						placeholder="Enter your 66-character chain ID"
						class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-[#39ff14] focus:outline-none"
						disabled={isConnecting}
					/>
					<p class="mt-1 text-xs text-zinc-400">
						Your chain ID is used to identify your wallet on the Linera network
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
						class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-[#39ff14] focus:outline-none"
						disabled={isConnecting}
					/>
				</div>

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
						disabled={isConnecting || !chainId.trim()}
						class="flex-1 rounded-lg bg-[#39ff14] px-4 py-2 font-medium text-black hover:bg-[#39ff14]/90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isConnecting ? 'Connecting...' : 'Connect'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
