<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { priceService, formatPrice, type PriceData } from '$lib/services/priceService';
	import { wallet } from '$lib/stores/wallet';
	import { addToast } from '$lib/stores/toasts';
	import { coinDraftsClient, SUBMIT_PORTFOLIO } from '$lib/coinDraftsClient';

	let walletState = $state($wallet);

	// Game ID from URL
	let gameId = $derived(page.params.gameId);

	// Available cryptos for quick match
	const availableCryptos = [
		{ id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
		{ id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
		{ id: 'solana', symbol: 'SOL', name: 'Solana' },
		{ id: 'cardano', symbol: 'ADA', name: 'Cardano' },
		{ id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
		{ id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
		{ id: 'polygon', symbol: 'MATIC', name: 'Polygon' },
		{ id: 'chainlink', symbol: 'LINK', name: 'Chainlink' }
	];

	// Portfolio state
	let selectedCryptos = $state<string[]>([]);
	let cryptoPrices = $state<Map<string, PriceData>>(new Map());
	let loading = $state(true);
	let submitting = $state(false);
	const maxCryptos = 5;

	// Computed
	let canSubmit = $derived(selectedCryptos.length === maxCryptos);
	let remaining = $derived(maxCryptos - selectedCryptos.length);

	$effect(() => {
		walletState = $wallet;
		if (!walletState.isConnected) {
			addToast('Please connect your wallet to submit portfolio', 'error');
			goto(`/games/${gameId}`);
			return;
		}

		loadPrices();
	});

	async function loadPrices() {
		try {
			loading = true;
			const slugs = availableCryptos.map((c) => c.id);
			const prices = await priceService.getCurrentPrices(slugs);

			const newPrices = new Map<string, PriceData>();
			prices.forEach((price) => {
				newPrices.set(price.id, price);
			});

			cryptoPrices = newPrices;
		} catch (error) {
			console.error('Error loading prices:', error);
			addToast('Failed to load crypto prices', 'error');
		} finally {
			loading = false;
		}
	}

	function toggleCrypto(cryptoId: string) {
		const index = selectedCryptos.indexOf(cryptoId);
		if (index > -1) {
			// Remove
			selectedCryptos = selectedCryptos.filter((id) => id !== cryptoId);
		} else {
			// Add if not at max
			if (selectedCryptos.length < maxCryptos) {
				selectedCryptos = [...selectedCryptos, cryptoId];
			} else {
				addToast(`Maximum ${maxCryptos} cryptocurrencies allowed`, 'info');
			}
		}
	}

	function clearSelection() {
		selectedCryptos = [];
		addToast('Selection cleared', 'info');
	}

	async function submitPortfolio() {
		if (!canSubmit) {
			addToast(`Please select exactly ${maxCryptos} cryptocurrencies`, 'info');
			return;
		}

		if (!walletState.isConnected) {
			addToast('Please connect your wallet', 'error');
			return;
		}

		try {
			submitting = true;

			// Convert crypto IDs to symbols
			const cryptoSymbols = selectedCryptos.map((id) => {
				const crypto = availableCryptos.find((c) => c.id === id);
				return crypto?.symbol || '';
			}).filter((symbol) => symbol !== '');

			console.log('Submitting portfolio:', { gameId, cryptocurrencies: cryptoSymbols });

			// Call backend mutation
			const result = await coinDraftsClient.mutate({
				mutation: SUBMIT_PORTFOLIO,
				variables: {
					gameId,
					cryptocurrencies: cryptoSymbols
				}
			});

			console.log('Portfolio submission result:', result);

			if (result.data) {
				addToast('Portfolio submitted successfully!', 'success');
				goto(`/games/${gameId}`);
			} else {
				throw new Error('No data returned from mutation');
			}
		} catch (error) {
			console.error('Error submitting portfolio:', error);
			addToast('Failed to submit portfolio. Please try again.', 'error');
		} finally {
			submitting = false;
		}
	}

	function getPriceData(id: string): PriceData | null {
		return cryptoPrices.get(id) || null;
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-5xl">
	<!-- Header -->
	<div class="mb-8">
		<button
			onclick={() => goto(`/games/${gameId}`)}
			class="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
		>
			<span>←</span>
			<span>Back to Game</span>
		</button>

		<h1 class="text-4xl font-bold mb-2">Submit Your Portfolio</h1>
		<p class="text-gray-400">
			Select exactly {maxCryptos} cryptocurrencies for this Quick Match game.
		</p>

		{#if remaining > 0}
			<div class="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
				<p class="text-yellow-400">
					<strong>{remaining}</strong>
					{remaining === 1 ? 'cryptocurrency' : 'cryptocurrencies'} remaining
				</p>
			</div>
		{:else}
			<div class="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
				<p class="text-green-400">
					✓ All {maxCryptos} cryptocurrencies selected! Ready to submit.
				</p>
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Available Cryptos -->
		<div class="lg:col-span-2">
			<h2 class="text-2xl font-bold mb-4">Available Cryptocurrencies</h2>

			{#if loading}
				<div class="flex items-center justify-center py-12">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
				</div>
			{:else}
				<div class="grid grid-cols-2 gap-3">
					{#each availableCryptos as crypto}
						{@const priceData = getPriceData(crypto.id)}
						{@const isSelected = selectedCryptos.includes(crypto.id)}

						<button
							onclick={() => toggleCrypto(crypto.id)}
							class="crypto-card p-4 rounded-lg border-2 transition-all text-left {isSelected ? 'border-blue-500 bg-blue-500/20' : 'border-gray-700 bg-gray-800 hover:border-blue-400'}"
						>
							<div class="flex items-start justify-between mb-2">
								<div>
									<div class="font-bold text-lg">{crypto.symbol}</div>
									<div class="text-sm text-gray-400">{crypto.name}</div>
								</div>
								{#if isSelected}
									<div class="text-green-400 text-xl">✓</div>
								{/if}
							</div>

							{#if priceData}
								<div class="text-sm mt-2">
									<div class="font-mono">{formatPrice(priceData.priceUsd)}</div>
									<div
										class="text-xs"
										class:text-green-400={priceData.changePercent24Hr > 0}
										class:text-red-400={priceData.changePercent24Hr < 0}
									>
										{priceData.changePercent24Hr > 0 ? '+' : ''}{priceData.changePercent24Hr.toFixed(
											2
										)}% 24h
									</div>
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Selected Portfolio -->
		<div>
			<h2 class="text-2xl font-bold mb-4">Your Selection</h2>

			<div class="bg-gray-800 rounded-lg border border-gray-700 p-4">
				<div class="text-sm text-gray-400 mb-3">
					{selectedCryptos.length} / {maxCryptos} selected
				</div>

				{#if selectedCryptos.length === 0}
					<div class="text-center text-gray-500 py-8">
						<p class="mb-2">No cryptocurrencies selected</p>
						<p class="text-xs">Click on cryptos to add them</p>
					</div>
				{:else}
					<div class="space-y-2 mb-4">
						{#each selectedCryptos as cryptoId, index}
							{@const crypto = availableCryptos.find((c) => c.id === cryptoId)}
							{@const priceData = getPriceData(cryptoId)}

							{#if crypto}
								<div class="flex items-center justify-between p-3 bg-gray-900 rounded border border-gray-700">
									<div class="flex items-center gap-2">
										<span class="text-gray-500 font-mono text-sm">{index + 1}.</span>
										<div>
											<div class="font-bold">{crypto.symbol}</div>
											{#if priceData}
												<div class="text-xs text-gray-400">{formatPrice(priceData.priceUsd)}</div>
											{/if}
										</div>
									</div>
									<button
										onclick={() => toggleCrypto(cryptoId)}
										class="text-red-400 hover:text-red-300 text-sm"
									>
										Remove
									</button>
								</div>
							{/if}
						{/each}
					</div>
				{/if}

				<!-- Action Buttons -->
				<div class="space-y-2 mt-4">
					<button
						onclick={clearSelection}
						disabled={submitting || selectedCryptos.length === 0}
						class="w-full px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
					>
						Clear Selection
					</button>

					<button
						onclick={submitPortfolio}
						disabled={!canSubmit || submitting}
						class="w-full px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
					>
						{#if submitting}
							<span class="flex items-center justify-center gap-2">
								<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								Submitting...
							</span>
						{:else}
							Submit Portfolio
						{/if}
					</button>
				</div>
			</div>

			<!-- Info -->
			<div class="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
				<div class="font-semibold text-blue-400 mb-1">ℹ️ Quick Match</div>
				<p class="text-gray-400 text-xs">
					In Quick Match, all selected cryptos have equal weight. Choose your best performers!
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.crypto-card:hover {
		transform: translateY(-2px);
	}
</style>
