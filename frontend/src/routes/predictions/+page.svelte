<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { pricePredictionService, type PredictionMarket } from '$lib/services/pricePredictionService';
	import { wallet } from '$lib/stores/wallet';
	import { TrendingUp, Clock, DollarSign, Users, Plus } from '@lucide/svelte';
	import { showToast } from '$lib/stores/toasts';

	let markets = $state<PredictionMarket[]>([]);
	let loading = $state(true);
	let showCreateModal = $state(false);

	// Create market form
	let selectedCrypto = $state('bitcoin');
	let entryFee = $state(1);
	let duration = $state(7);
	let creating = $state(false);

	const topCryptos = [
		{ id: 'bitcoin', name: 'Bitcoin (BTC)' },
		{ id: 'ethereum', name: 'Ethereum (ETH)' },
		{ id: 'solana', name: 'Solana (SOL)' },
		{ id: 'cardano', name: 'Cardano (ADA)' },
		{ id: 'polkadot', name: 'Polkadot (DOT)' },
		{ id: 'avalanche', name: 'Avalanche (AVAX)' },
		{ id: 'chainlink', name: 'Chainlink (LINK)' },
		{ id: 'polygon', name: 'Polygon (MATIC)' },
		{ id: 'uniswap', name: 'Uniswap (UNI)' },
		{ id: 'litecoin', name: 'Litecoin (LTC)' }
	];

	onMount(async () => {
		await loadMarkets();
	});

	async function loadMarkets() {
		loading = true;
		markets = await pricePredictionService.fetchActiveMarkets();
		loading = false;
	}

	async function createMarket() {
		if (!$wallet.isConnected) {
			showToast('Please connect your wallet first', 'error');
			return;
		}

		creating = true;
		const success = await pricePredictionService.createMarket(
			selectedCrypto,
			entryFee * 1_000_000, // Convert to micro-USDC
			duration
		);

		if (success) {
			showToast('Prediction market created successfully!', 'success');
			showCreateModal = false;
			window.location.reload();
		} else {
			showToast('Failed to create market', 'error');
		}
		creating = false;
	}

	function formatTimeRemaining(endTime: number): string {
		const now = Date.now() * 1000; // Convert to microseconds
		const remaining = endTime - now;
		const days = Math.floor(remaining / (24 * 60 * 60 * 1_000_000));
		const hours = Math.floor((remaining % (24 * 60 * 60 * 1_000_000)) / (60 * 60 * 1_000_000));
		return `${days}d ${hours}h`;
	}

	function goToMarket(marketId: string) {
		goto(`/predictions/${marketId}`);
	}
</script>

<div class="min-h-screen bg-black text-green-400 p-6">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-4xl font-bold text-green-400 mb-2 flex items-center gap-3">
					<TrendingUp size={40} />
					Price Predictions
				</h1>
				<p class="text-gray-400">Predict price ranges and earn up to 20x multipliers</p>
			</div>
			
			<button
				onclick={() => showCreateModal = true}
				class="bg-green-600 hover:bg-green-700 text-black px-6 py-3 rounded-full font-semibold transition-colors flex items-center gap-2"
			>
				<Plus size={20} />
				Create Market
			</button>
		</div>

		<!-- Loading State -->
		{#if loading}
			<div class="flex justify-center items-center py-20">
				<div class="text-green-400 text-xl">Loading prediction markets...</div>
			</div>
		{:else if markets.length === 0}
			<div class="bg-gray-900 rounded-lg p-12 text-center border border-green-500/20">
				<TrendingUp size={64} class="mx-auto mb-4 text-gray-600" />
				<h2 class="text-2xl font-bold text-gray-400 mb-2">No Active Markets</h2>
				<p class="text-gray-500 mb-6">Create the first prediction market!</p>
				<button
					onclick={() => showCreateModal = true}
					class="bg-green-600 hover:bg-green-700 text-black px-8 py-3 rounded-full font-semibold transition-colors"
				>
					Create Market
				</button>
			</div>
		{:else}
			<!-- Markets Grid -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each markets as market}
					<div
						class="bg-gray-900 rounded-lg p-6 border border-green-500/20 hover:border-green-500/50 transition-all cursor-pointer"
						onclick={() => goToMarket(market.id)}
					>
						<div class="flex items-center justify-between mb-4">
							<h3 class="text-xl font-bold text-green-400 uppercase">{market.cryptoId}</h3>
							<span class="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm">
								{market.status}
							</span>
						</div>

						<div class="space-y-3 mb-4">
							<div class="flex items-center gap-2 text-gray-300">
								<DollarSign size={16} />
								<span class="text-sm">Entry: ${(market.entryFee / 1_000_000).toFixed(2)} USDC</span>
							</div>

							<div class="flex items-center gap-2 text-gray-300">
								<Clock size={16} />
								<span class="text-sm">{formatTimeRemaining(market.endTime)} remaining</span>
							</div>
						</div>

						<button
							class="w-full bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded-full font-semibold transition-colors"
						>
							Make Prediction
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Create Market Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
		<div class="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-green-500/30">
			<h2 class="text-2xl font-bold text-green-400 mb-6">Create Prediction Market</h2>

			<div class="space-y-4">
				<!-- Crypto Selection -->
				<div>
					<label class="block text-sm font-semibold text-gray-400 mb-2">Cryptocurrency</label>
					<select
						bind:value={selectedCrypto}
						class="w-full bg-black border border-green-500/30 rounded-lg px-4 py-2 text-green-400 focus:border-green-500 outline-none"
					>
						{#each topCryptos as crypto}
							<option value={crypto.id}>{crypto.name}</option>
						{/each}
					</select>
				</div>

				<!-- Entry Fee -->
				<div>
					<label class="block text-sm font-semibold text-gray-400 mb-2">Entry Fee (USDC)</label>
					<input
						type="number"
						bind:value={entryFee}
						min="0.1"
						step="0.1"
						class="w-full bg-black border border-green-500/30 rounded-lg px-4 py-2 text-green-400 focus:border-green-500 outline-none"
					/>
				</div>

				<!-- Duration -->
				<div>
					<label class="block text-sm font-semibold text-gray-400 mb-2">Duration (Days)</label>
					<select
						bind:value={duration}
						class="w-full bg-black border border-green-500/30 rounded-lg px-4 py-2 text-green-400 focus:border-green-500 outline-none"
					>
						<option value={1}>1 Day</option>
						<option value={3}>3 Days</option>
						<option value={7}>7 Days</option>
						<option value={14}>14 Days</option>
					</select>
				</div>
			</div>

			<div class="flex gap-3 mt-6">
				<button
					onclick={() => showCreateModal = false}
					class="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-full font-semibold transition-colors"
				>
					Cancel
				</button>
				<button
					onclick={createMarket}
					disabled={creating}
					class="flex-1 bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded-full font-semibold transition-colors disabled:opacity-50"
				>
					{creating ? 'Creating...' : 'Create'}
				</button>
			</div>
		</div>
	</div>
{/if}
