<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { pricePredictionService, type PredictionMarket } from '$lib/services/pricePredictionService';
	import { wallet } from '$lib/stores/wallet';
	import { showToast } from '$lib/stores/toasts';
	import { goto } from '$app/navigation';
	import { TrendingUp, ArrowLeft, Sparkles } from '@lucide/svelte';

	const marketId = page.params.marketId!;

	let market = $state<PredictionMarket | null>(null);
	let loading = $state(true);
	let submitting = $state(false);
	let currentPrice = $state<number | null>(null);
	let loadingAI = $state(false);

	// Form state
	let minPrice = $state(0);
	let maxPrice = $state(0);
	let confidence = $state(50);
	let aiAssisted = $state(false);

	// Calculated values
	let rangeWidth = $derived(maxPrice - minPrice);
	let multiplier = $derived(
		pricePredictionService.calculateMultiplier(minPrice, maxPrice, confidence, aiAssisted)
	);
	let potentialReward = $derived(
		market ? ((market.entryFee / 1_000_000) * multiplier).toFixed(2) : '0.00'
	);

	onMount(async () => {
		await loadMarket();
	});

	async function loadMarket() {
		loading = true;
		market = await pricePredictionService.fetchPredictionMarket(marketId);
		if (market) {
			currentPrice = await pricePredictionService.fetchCurrentPrice(market.cryptoId);
		}
		loading = false;
	}

	async function getAISuggestion() {
		if (!market) return;
		
		loadingAI = true;
		const priceToUse = currentPrice || 50000; // Fallback if price fetch failed
		const suggestion = await pricePredictionService.getAISuggestion(market.cryptoId, priceToUse);
		if (suggestion) {
			minPrice = suggestion.minPrice;
			maxPrice = suggestion.maxPrice;
			aiAssisted = true;
			showToast('AI suggestion applied!', 'success');
		} else {
			showToast('Failed to get AI suggestion', 'error');
		}
		loadingAI = false;
	}

	async function submitPrediction() {
		if (!$wallet.isConnected) {
			showToast('Please connect your wallet first', 'error');
			return;
		}

		if (minPrice <= 0 || maxPrice <= 0) {
			showToast('Please enter valid prices', 'error');
			return;
		}

		if (minPrice >= maxPrice) {
			showToast('Max price must be greater than min price', 'error');
			return;
		}

		submitting = true;
		const success = await pricePredictionService.submitPrediction(
			marketId,
			minPrice,
			maxPrice,
			confidence,
			aiAssisted
		);

		if (success) {
			showToast('Prediction submitted successfully!', 'success');
			goto('/predictions');
		} else {
			showToast('Failed to submit prediction', 'error');
		}
		submitting = false;
	}

	function getDifficultyColor(width: number): string {
		if (width <= 1) return 'text-red-400';
		if (width <= 5) return 'text-orange-400';
		if (width <= 10) return 'text-yellow-400';
		if (width <= 20) return 'text-blue-400';
		return 'text-green-400';
	}

	function getDifficultyLabel(width: number): string {
		if (width <= 1) return 'Extremely Difficult (20x)';
		if (width <= 5) return 'Very Difficult (10x)';
		if (width <= 10) return 'Difficult (5x)';
		if (width <= 20) return 'Moderate (2.5x)';
		if (width <= 50) return 'Easy (1.5x)';
		return 'Very Easy (1x)';
	}
</script>

<div class="min-h-screen bg-black text-green-400 p-6">
	<div class="max-w-4xl mx-auto">
		<!-- Back Button -->
		<a href="/predictions" class="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors mb-6">
			<ArrowLeft size={20} />
			Back to Markets
		</a>

		{#if loading}
			<div class="flex justify-center items-center py-20">
				<div class="text-green-400 text-xl">Loading market...</div>
			</div>
		{:else if !market}
			<div class="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
				<div class="text-red-400 text-xl mb-4">Market not found</div>
				<a href="/predictions" class="text-green-400 hover:underline">Return to markets</a>
			</div>
		{:else}
			<!-- Market Info -->
			<div class="bg-gray-900 rounded-lg p-6 mb-6 border border-green-500/20">
				<div class="flex items-center justify-between mb-4">
					<h1 class="text-3xl font-bold text-green-400 uppercase flex items-center gap-3">
						<TrendingUp size={32} />
						{market.cryptoId} Price Prediction
					</h1>
					<span class="bg-green-600/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold">
						{market.status}
					</span>
				</div>
				
				{#if currentPrice}
					<div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
						<div class="text-sm text-gray-400">Current Price</div>
						<div class="text-3xl font-bold text-green-400">${currentPrice.toFixed(2)}</div>
					</div>
				{/if}
					
				
				</div>

				<div class="grid grid-cols-2 gap-4 text-gray-300">
					<div>
						<span class="text-sm text-gray-400">Entry Fee:</span>
						<div class="text-xl font-bold text-green-400">${(market.entryFee / 1_000_000).toFixed(2)} USDC</div>
					</div>
					<div>
						<span class="text-sm text-gray-400">Duration:</span>
						<div class="text-xl font-bold text-green-400">
							{Math.round((market.endTime - market.startTime) / (24 * 60 * 60 * 1_000_000))} Days
						</div>
					</div>
				</div>
		

			<!-- Prediction Form -->
			<div class="bg-gray-900 rounded-lg p-6 border border-green-500/20">
				<h2 class="text-2xl font-bold text-green-400 mb-6">Make Your Prediction</h2>

				<div class="space-y-6">
					<!-- Price Range -->
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-semibold text-gray-400 mb-2">Min Price ($)</label>
							<input
								type="number"
								bind:value={minPrice}
								step="0.01"
								placeholder="e.g., 42000"
								class="w-full bg-black border border-green-500/30 rounded-lg px-4 py-3 text-green-400 focus:border-green-500 outline-none"
							/>
						</div>

						<div>
							<label class="block text-sm font-semibold text-gray-400 mb-2">Max Price ($)</label>
							<input
								type="number"
								bind:value={maxPrice}
								step="0.01"
								placeholder="e.g., 42100"
								class="w-full bg-black border border-green-500/30 rounded-lg px-4 py-3 text-green-400 focus:border-green-500 outline-none"
							/>
						</div>
					</div>

					<!-- Range Display -->
					{#if rangeWidth > 0}
						<div class="bg-black/50 rounded-lg p-4 border border-green-500/20">
							<div class="flex items-center justify-between">
								<span class="text-gray-400">Range Width:</span>
								<span class="text-xl font-bold {getDifficultyColor(rangeWidth)}">${rangeWidth.toFixed(2)}</span>
							</div>
							<div class="text-sm {getDifficultyColor(rangeWidth)} mt-1">
								{getDifficultyLabel(rangeWidth)}
							</div>
						</div>
					{/if}

					<!-- Confidence Slider -->
					<div>
						<div class="flex items-center justify-between mb-2">
							<label class="text-sm font-semibold text-gray-400">Confidence Level</label>
							<span class="text-green-400 font-bold">{confidence}%</span>
						</div>
						<input
							type="range"
							bind:value={confidence}
							min="0"
							max="100"
							class="w-full"
						/>
						<div class="flex justify-between text-xs text-gray-500 mt-1">
							<span>1.0x</span>
							<span>1.25x</span>
							<span>1.5x</span>
						</div>
					</div>

					<!-- AI Assistance Toggle -->
					<div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
						<div class="flex items-center gap-3 mb-3">
							<Sparkles size={18} class="text-blue-400" />
							<div class="flex-1 text-blue-400 font-semibold">AI Price Suggestions</div>
							<button
								onclick={getAISuggestion}
								disabled={loadingAI}
								class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loadingAI ? 'Loading...' : 'Get Suggestion'}
							</button>
						</div>
						<div class="text-sm text-gray-400">
							Get AI-powered range recommendations (0.8x multiplier penalty)
							{#if !currentPrice}
								<div class="text-yellow-400 text-xs mt-1">⚠️ Current price unavailable - AI will use market data</div>
							{/if}
						</div>
					</div>

					<!-- Multiplier Display -->
					<div class="bg-gradient-to-r from-green-900/30 to-green-600/30 rounded-lg p-6 border border-green-500/50">
						<div class="text-center">
							<div class="text-sm text-gray-400 mb-2">Estimated Multiplier</div>
							<div class="text-5xl font-bold text-green-400 mb-4">{multiplier.toFixed(2)}x</div>
							<div class="text-xl text-gray-300">
								Potential Reward: <span class="text-green-400 font-bold">${potentialReward} USDC</span>
							</div>
						</div>
					</div>

					<!-- Submit Button -->
					<button
						onclick={submitPrediction}
						disabled={submitting || !market || rangeWidth <= 0}
						class="w-full bg-green-600 hover:bg-green-700 text-black px-6 py-4 rounded-full font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{submitting ? 'Submitting...' : 'Submit Prediction'}
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
