<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { priceService, formatPrice, type PriceData } from '$lib/services/priceService';
	import { wallet, getWalletState } from '$lib/stores/wallet';
	import { addToast } from '$lib/stores/toasts';
	import { tradLeaguesClient, SUBMIT_TOURNAMENT_PORTFOLIO } from '$lib/coinDraftsClient';
	import { getCryptosForCategory, type CryptoInfo } from '$lib/data/cryptoCategories';
	import { coinDraftsService, type Tournament } from '$lib/coinDraftsService';
	import { gql } from '@apollo/client/core';
	import { getAISuggestions, type AISuggestionResponse } from '$lib/services/aiSuggestionService';
	import AISuggestionCard from '$lib/components/AISuggestionCard.svelte';

	// Tournament ID from URL
	let tournamentId = $derived(page.params.tournamentId);

	// Tournament data and available cryptos
	let tournament = $state<Tournament | null>(null);
	let availableCryptos = $state<CryptoInfo[]>([]);
	let loadingTournament = $state(true);

	// Position weights for display
	const positionWeights = [
		{ position: 1, weight: '5x', color: 'from-red-500 to-orange-500', label: 'Highest Confidence' },
		{ position: 2, weight: '4x', color: 'from-orange-500 to-yellow-500', label: 'High Confidence' },
		{
			position: 3,
			weight: '3x',
			color: 'from-yellow-500 to-green-500',
			label: 'Medium Confidence'
		},
		{ position: 4, weight: '2x', color: 'from-green-500 to-blue-500', label: 'Low Confidence' },
		{ position: 5, weight: '1x', color: 'from-blue-500 to-purple-500', label: 'Lowest Confidence' }
	];

	// Draft state
	let draftPicks = $state<(string | null)[]>([null, null, null, null, null]);
	let cryptoPrices = $state<Map<string, PriceData>>(new Map());
	let loading = $state(true);
	let submitting = $state(false);
	let draggedCrypto = $state<string | null>(null);
	let draggedFromPosition = $state<number | null>(null);

	// AI suggestions state
	let aiSuggestions = $state<AISuggestionResponse | null>(null);
	let aiLoading = $state(false);
	let aiError = $state<string | null>(null);

	// Computed
	let selectedCryptoIds = $derived(draftPicks.filter((pick) => pick !== null) as string[]);
	let isComplete = $derived(draftPicks.every((pick) => pick !== null));
	let remainingPicks = $derived(draftPicks.filter((pick) => pick === null).length);

	// Load tournament data on mount
	$effect(() => {
		loadTournamentData();
	});

	async function loadTournamentData() {
		if (!$wallet.isConnected) {
			addToast('Please connect your wallet to draft a portfolio', 'info');
			goto(`/tournaments/${tournamentId}`);
			return;
		}
		try {
			loadingTournament = true;

			// Load tournament details
			const tournaments = await coinDraftsService.fetchTournaments();
			tournament = tournaments.find((t) => t.id === tournamentId) || null;

			if (!tournament) {
				addToast('Tournament not found', 'error');
				goto('/tournaments');
				return;
			}

			// Load cryptos based on tournament category
			availableCryptos = getCryptosForCategory(tournament.category || 'ALL_CATEGORIES');

			// Load prices
			await loadPrices();
		} catch (error) {
			console.error('Error loading tournament:', error);
			addToast('Failed to load tournament details', 'error');
		} finally {
			loadingTournament = false;
		}
	}

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

	// Drag and drop handlers for available cryptos
	function handleDragStart(cryptoId: string) {
		draggedCrypto = cryptoId;
		draggedFromPosition = null;
	}

	// Drag and drop handlers for draft positions
	function handleDragStartFromPosition(position: number) {
		const pick = draftPicks[position];
		if (pick) {
			draggedCrypto = pick;
			draggedFromPosition = position;
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	function handleDropOnPosition(position: number) {
		if (!draggedCrypto) return;

		// If dragging from another position, swap
		if (draggedFromPosition !== null) {
			const temp = draftPicks[position];
			draftPicks[position] = draggedCrypto;
			draftPicks[draggedFromPosition] = temp;
		} else {
			// If crypto already selected, remove it first
			const existingIndex = draftPicks.indexOf(draggedCrypto);
			if (existingIndex !== -1) {
				draftPicks[existingIndex] = null;
			}

			// Add to new position
			draftPicks[position] = draggedCrypto;
		}

		draggedCrypto = null;
		draggedFromPosition = null;
	}

	function handleDropOnAvailable() {
		if (draggedFromPosition !== null) {
			// Remove from draft position
			draftPicks[draggedFromPosition] = null;
		}

		draggedCrypto = null;
		draggedFromPosition = null;
	}

	function addToPosition(cryptoId: string) {
		// Find first empty position
		const emptyIndex = draftPicks.findIndex((pick) => pick === null);
		if (emptyIndex !== -1) {
			draftPicks[emptyIndex] = cryptoId;
		} else {
			addToast('All positions filled. Remove a crypto first.', 'info');
		}
	}

	function removeFromPosition(position: number) {
		draftPicks[position] = null;
	}

	function clearDraft() {
		draftPicks = [null, null, null, null, null];
		addToast('Draft cleared', 'info');
	}

	async function handleRequestAISuggestions() {
		if (aiLoading) return;

		try {
			aiLoading = true;
			aiError = null;
			aiSuggestions = null;

			aiSuggestions = await getAISuggestions({
				availableCoins: availableCryptos.map((c) => c.symbol),
				gameType: 'tournament',
				maxPicks: 5
			});
		} catch (err: any) {
			aiError = err.message || 'Failed to get AI suggestions';
			console.error('AI suggestion error:', err);
		} finally {
			aiLoading = false;
		}
	}

	function handleAcceptAISuggestions(cryptos: string[]) {
		// Convert symbols to IDs and fill draft picks
		draftPicks = cryptos.slice(0, 5).map((symbol) => {
			const crypto = availableCryptos.find((c) => c.symbol === symbol);
			return crypto?.id || null;
		});
		aiSuggestions = null;
		addToast('AI suggestions applied to draft', 'success');
	}

	async function submitDraft() {
		if (!isComplete) {
			addToast('Please fill all 5 positions before submitting', 'info');
			return;
		}

		if (!$wallet.isConnected) {
			addToast('Please connect your wallet', 'error');
			return;
		}

		try {
			submitting = true;

			console.log('🔍 Step 1: Registering for tournament...');
			console.log('Player account:', $wallet.chainId);
			
			// STEP 1: Register for tournament (like test script)
			const registrationResult = await tradLeaguesClient.mutate({
				mutation: gql`
					mutation RegisterForTournament($tournamentId: String!, $playerAccount: String!) {
						registerForTournament(tournamentId: $tournamentId, playerAccount: $playerAccount)
					}
				`,
				variables: {
					tournamentId,
					playerAccount: $wallet.chainId
				}
			});
			
			console.log('✅ Registration result:', registrationResult);
			
			if (!registrationResult.data) {
				throw new Error('Registration failed - no transaction ID returned');
			}

			// STEP 2: Extract crypto IDs (NOT symbols!) for backend
			// Backend expects lowercase full names like "bitcoin", "ethereum" (the ID, not the symbol)
			const cryptoPicks = draftPicks
				.filter((pick) => pick !== null)
				.map((pick) => {
					const crypto = availableCryptos.find((c) => c.id === pick);
					return crypto?.id || ''; // Use ID (bitcoin, ethereum), NOT symbol (BTC, ETH)
				})
				.filter((id) => id !== '');

			console.log('🔍 Step 2: Submitting portfolio...');
			console.log('Crypto picks (using IDs):', cryptoPicks);
			console.log('Portfolio data:', {
				tournamentId,
				cryptoPicks
			});

			// STEP 3: Submit portfolio
			const walletState = getWalletState();
			const result = await tradLeaguesClient.mutate({
				mutation: SUBMIT_TOURNAMENT_PORTFOLIO,
				variables: {
					tournamentId,
					playerAccount: walletState.chainId,
					cryptoPicks,
					strategyNotes: null
				}
			});

			console.log(' Portfolio submission result:', result);

			if (result.data) {
				addToast('Registered and portfolio submitted successfully!', 'success');
				setTimeout(() => {
					window.location.href = `/tournaments/${tournamentId}`;
				}, 1000);
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

	function getCryptoById(id: string | null) {
		if (!id) return null;
		return availableCryptos.find((c) => c.id === id);
	}

	function getPriceData(id: string | null): PriceData | null {
		if (!id) return null;
		return cryptoPrices.get(id) || null;
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<!-- Header -->
	<div class="mb-8">
		<button
			onclick={() => goto(`/tournaments/${tournamentId}`)}
			class="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
		>
			<span>←</span>
			<span>Back to Tournament</span>
		</button>

		<h1 class="text-4xl font-bold mb-2">Draft Your Portfolio</h1>
		{#if tournament}
			<p class="text-gray-400 mb-2">
				Category: <span class="text-blue-400 font-semibold"
					>{tournament.category?.replace('_', ' ')}</span
				>
			</p>
		{/if}
		<p class="text-gray-400">
			Rank 5 cryptocurrencies by confidence. Position 1 gets 5x weight, Position 5 gets 1x weight.
		</p>

		{#if remainingPicks > 0}
			<div class="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
				<p class="text-yellow-400">
					<strong>{remainingPicks}</strong>
					{remainingPicks === 1 ? 'position' : 'positions'} remaining
				</p>
			</div>
		{:else}
			<div class="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
				<p class="text-green-400">✓ All positions filled! Ready to submit.</p>
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Available Cryptos -->
		<div>
			<h2 class="text-2xl font-bold mb-4">Available Cryptocurrencies</h2>

			<!-- AI Suggestion Card -->
			{#if !loading && !loadingTournament}
				<div class="mb-6">
					<AISuggestionCard
						suggestions={aiSuggestions}
						loading={aiLoading}
						error={aiError}
						onAccept={handleAcceptAISuggestions}
						onRequestSuggestions={handleRequestAISuggestions}
					/>
				</div>
			{/if}

			{#if loading || loadingTournament}
				<div class="flex items-center justify-center py-12">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
				</div>
			{:else}
				<div
					class="grid grid-cols-2 gap-3"
					role="list"
					ondrop={(e) => {
						e.preventDefault();
						handleDropOnAvailable();
					}}
					ondragover={(e) => e.preventDefault()}
				>
					{#each availableCryptos as crypto}
						{@const priceData = getPriceData(crypto.id)}
						{@const isSelected = selectedCryptoIds.includes(crypto.id)}

						<div
							draggable="true"
							role="listitem"
							ondragstart={() => handleDragStart(crypto.id)}
							class="crypto-card p-4 rounded-lg border transition-all cursor-move"
							class:opacity-50={isSelected}
							class:border-gray-700={!isSelected}
							class:bg-gray-800={!isSelected}
							class:border-blue-500={isSelected}
							class:bg-blue-500={isSelected}
							style:background-color={isSelected ? 'rgba(59, 130, 246, 0.1)' : ''}
						>
							<div class="flex items-start justify-between mb-2">
								<div>
									<div class="font-bold text-lg">{crypto.symbol}</div>
									<div class="text-sm text-gray-400">{crypto.name}</div>
								</div>
								{#if !isSelected}
									<button
										onclick={() => addToPosition(crypto.id)}
										class="text-blue-400 hover:text-blue-300 text-sm"
									>
										Add →
									</button>
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
										{priceData.changePercent24Hr > 0
											? '+'
											: ''}{priceData.changePercent24Hr.toFixed(2)}% 24h
									</div>
								</div>
							{/if}

							{#if isSelected}
								<div class="mt-2 text-xs text-blue-400">✓ Selected in draft</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Draft Positions -->
		<div>
			<h2 class="text-2xl font-bold mb-4">Your Draft Picks</h2>

			<div class="space-y-3">
				{#each positionWeights as { position, weight, color, label }, index}
					{@const pick = draftPicks[index]}
					{@const crypto = getCryptoById(pick)}
					{@const priceData = getPriceData(pick)}

					<div
						class="draft-position p-4 rounded-lg border-2 border-dashed transition-all"
						role="region"
						aria-label="Position {position}"
						class:border-gray-700={!pick}
						class:empty-position={!pick}
						class:border-transparent={pick}
						class:bg-gradient-to-r={pick}
						class:from-gray-800={pick}
						class:to-gray-700={pick}
						ondrop={(e) => {
							e.preventDefault();
							handleDropOnPosition(index);
						}}
						ondragover={(e) => e.preventDefault()}
					>
						<div class="flex items-center justify-between mb-2">
							<div class="flex items-center gap-3">
								<div
									class="w-12 h-12 rounded-full bg-gradient-to-br {color} flex items-center justify-center font-bold text-white"
								>
									{weight}
								</div>
								<div>
									<div class="text-sm text-gray-400">Position {position}</div>
									<div class="text-xs text-gray-500">{label}</div>
								</div>
							</div>

							{#if pick}
								<button
									onclick={() => removeFromPosition(index)}
									class="text-red-400 hover:text-red-300 text-sm"
								>
									Remove
								</button>
							{/if}
						</div>

						{#if crypto}
							<div
								draggable="true"
								role="button"
								tabindex="0"
								aria-label="Drag to reorder {crypto.name}"
								ondragstart={() => handleDragStartFromPosition(index)}
								class="mt-3 p-3 bg-gray-900/50 rounded border border-gray-700 cursor-move"
							>
								<div class="flex items-center justify-between">
									<div>
										<div class="font-bold">{crypto.symbol}</div>
										<div class="text-sm text-gray-400">{crypto.name}</div>
									</div>
									{#if priceData}
										<div class="text-right text-sm">
											<div class="font-mono">{formatPrice(priceData.priceUsd)}</div>
											<div
												class="text-xs"
												class:text-green-400={priceData.changePercent24Hr > 0}
												class:text-red-400={priceData.changePercent24Hr < 0}
											>
												{priceData.changePercent24Hr > 0
													? '+'
													: ''}{priceData.changePercent24Hr.toFixed(2)}%
											</div>
										</div>
									{/if}
								</div>
							</div>
						{:else}
							<div class="mt-3 text-center text-gray-500 text-sm py-4">
								Drag a crypto here or click "Add"
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Action Buttons -->
			<div class="mt-6 flex gap-3">
				<button
					onclick={clearDraft}
					disabled={submitting || selectedCryptoIds.length === 0}
					class="flex-1 px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					Clear Draft
				</button>

				<button
					onclick={submitDraft}
					disabled={!isComplete || submitting}
					class="flex-1 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
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

			<!-- Strategy Tip -->
			<div class="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm">
				<div class="font-semibold text-blue-400 mb-2">💡 Strategy Tip</div>
				<p class="text-gray-400">
					Put your highest confidence pick in Position 1 for maximum impact (5x weight). Your
					Position 1 pick has as much influence as all your other picks combined!
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.crypto-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}

	.draft-position {
		min-height: 140px;
	}

	.empty-position {
		background-color: rgb(31 41 55 / 0.5);
	}
</style>
