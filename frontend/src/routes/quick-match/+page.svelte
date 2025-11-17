<script lang="ts">
	import { onMount } from 'svelte';
	import { coinDraftsService } from '$lib/coinDraftsService';
	import type { Game } from '$lib/coinDraftsService';

	let games: Game[] = $state([]);
	let loading = $state(true);
	let showCreateModal = $state(false);
	let selectedMode = $state('QuickMatch');

	onMount(async () => {
		await loadGames();
	});

	async function loadGames() {
		try {
			loading = true;
			const allGames = await coinDraftsService.fetchGames();
			// Filter for QuickMatch games only
			games = allGames.filter(game => game.mode === 'QuickMatch');
		} catch (error) {
			console.error('Error loading games:', error);
		} finally {
			loading = false;
		}
	}

	async function createGame() {
		try {
			const result = await coinDraftsService.createGame(selectedMode);
			if (result.success) {
				showCreateModal = false;
				await loadGames();
			}
		} catch (error) {
			console.error('Error creating game:', error);
		}
	}
</script>

<svelte:head>
	<title>Quick Match - CoinDrafts</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="flex flex-col md:flex-row justify-between items-center mb-8">
		<div>
			<h1 class="text-4xl font-bold text-white mb-2">⚡ Quick Match</h1>
			<p class="text-text-secondary">Fast-paced 24-hour cryptocurrency portfolio contests</p>
		</div>
		<button 
			onclick={() => showCreateModal = true}
			class="bg-primary-green hover:bg-dark-green text-black font-bold py-3 px-6 rounded-lg transition-colors"
		>
			🎮 Create Game
		</button>
	</div>

	<!-- Game Info Cards -->
	<div class="grid md:grid-cols-3 gap-6 mb-8">
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30">
			<div class="text-3xl mb-3">⏱️</div>
			<h3 class="text-lg font-semibold text-white mb-2">24-Hour Duration</h3>
			<p class="text-text-secondary text-sm">Games run for exactly 24 hours from start time</p>
		</div>
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
			<div class="text-3xl mb-3">💰</div>
			<h3 class="text-lg font-semibold text-white mb-2">Low Entry Fees</h3>
			<p class="text-text-secondary text-sm">Start with as little as $1 entry fee</p>
		</div>
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30">
			<div class="text-3xl mb-3">🚀</div>
			<h3 class="text-lg font-semibold text-white mb-2">Instant Results</h3>
			<p class="text-text-secondary text-sm">Winners determined as soon as games end</p>
		</div>
	</div>

	<!-- Active Games -->
	{#if loading}
		<div class="text-center py-12">
			<div class="text-text-secondary text-lg">Loading active games...</div>
		</div>
	{:else if games.length === 0}
		<div class="text-center py-12">
			<div class="text-6xl mb-4">⚡</div>
			<h3 class="text-2xl font-semibold text-white mb-4">No Active Quick Matches</h3>
			<p class="text-text-secondary mb-8 max-w-md mx-auto">
				Be the first to start a quick match! Create a game and invite others to compete in real-time cryptocurrency portfolio contests.
			</p>
			<button 
				onclick={() => showCreateModal = true}
				class="bg-primary-green hover:bg-dark-green text-black font-bold py-4 px-8 rounded-lg text-lg transition-colors"
			>
				🎮 Create First Game
			</button>
		</div>
	{:else}
		<div>
			<h2 class="text-2xl font-bold text-white mb-6">🔥 Active Games ({games.length})</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each games as game}
					<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30 hover:border-primary-green/50 transition-all duration-200 hover:transform hover:scale-105">
						<!-- Game Header -->
						<div class="flex justify-between items-start mb-4">
							<div>
								<h3 class="text-lg font-semibold text-white">Game #{game.gameId.slice(-6)}</h3>
								<p class="text-sm text-text-secondary">{game.mode}</p>
							</div>
							<span class="text-xs px-3 py-1 rounded-full border {
								game.status === 'Active' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
								game.status === 'Pending' ? 'bg-primary-green/10 text-text-secondary border-border-color' :
								'bg-gray-500/20 text-gray-300 border-gray-500/30'
							}">
								{game.status}
							</span>
						</div>

						<!-- Game Stats -->
						<div class="space-y-3 mb-6">
							<div class="flex justify-between text-sm">
								<span class="text-text-secondary">Players:</span>
								<span class="text-white font-medium">{game.playerCount}/{game.maxPlayers}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-text-secondary">Created:</span>
								<span class="text-white font-medium">
									{new Date(game.createdAt * 1000).toLocaleDateString()}
								</span>
							</div>
						</div>

						<!-- Player Progress Bar -->
						<div class="mb-6">
							<div class="flex justify-between text-xs text-text-secondary mb-1">
								<span>Slots Filled</span>
								<span>{Math.round((game.playerCount / game.maxPlayers) * 100)}%</span>
							</div>
							<div class="w-full bg-white/20 rounded-full h-2">
								<div 
									class="h-2 rounded-full transition-all duration-300"
									style="background: linear-gradient(to right, #3b82f6, #06b6d4); width: {(game.playerCount / game.maxPlayers) * 100}%"
								></div>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-2">
							<a 
								href="/games/{game.gameId}"
								class="flex-1 bg-primary-green hover:bg-dark-green text-black text-center py-2 rounded-lg transition-colors font-medium"
							>
								View Game
							</a>
							{#if game.status === 'Pending' && game.playerCount < game.maxPlayers}
								<a 
									href="/games/{game.gameId}/join"
									class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
								>
									Join
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- How Quick Match Works -->
	<div class="mt-16">
		<h2 class="text-3xl font-bold text-white mb-8 text-center">How Quick Match Works</h2>
		<div class="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
			<div class="text-center">
				<div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style="background: linear-gradient(45deg, #3b82f6, #06b6d4)">
					<span class="text-white font-bold">1</span>
				</div>
				<h3 class="font-semibold text-white mb-2">Pick 5 Cryptos</h3>
				<p class="text-sm text-text-secondary">Select your top 5 cryptocurrencies</p>
			</div>
			<div class="text-center">
				<div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style="background: linear-gradient(45deg, #06b6d4, #10b981)">
					<span class="text-white font-bold">2</span>
				</div>
				<h3 class="font-semibold text-white mb-2">24-Hour Window</h3>
				<p class="text-sm text-text-secondary">Game runs for exactly 24 hours</p>
			</div>
			<div class="text-center">
				<div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style="background: linear-gradient(45deg, #10b981, #f59e0b)">
					<span class="text-white font-bold">3</span>
				</div>
				<h3 class="font-semibold text-white mb-2">Real-Time Tracking</h3>
				<p class="text-sm text-text-secondary">Watch live price movements</p>
			</div>
			<div class="text-center">
				<div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style="background: linear-gradient(45deg, #f59e0b, #8b5cf6)">
					<span class="text-white font-bold">4</span>
				</div>
				<h3 class="font-semibold text-white mb-2">Instant Payout</h3>
				<p class="text-sm text-text-secondary">Winners paid immediately</p>
			</div>
		</div>
	</div>
</div>

<!-- Create Game Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30 max-w-md w-full">
			<h2 class="text-2xl font-bold text-white mb-6">Create Quick Match</h2>
			
			<div class="space-y-6">
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-3">Game Mode</label>
					<div class="space-y-2">
						<label class="flex items-center space-x-3">
							<input 
								type="radio" 
								bind:group={selectedMode} 
								value="QuickMatch"
								class="text-primary-green"
							>
							<div>
								<div class="text-white font-medium">Quick Match</div>
								<div class="text-sm text-text-secondary">24-hour portfolio contest</div>
							</div>
						</label>
						<label class="flex items-center space-x-3 opacity-50">
							<input 
								type="radio" 
								disabled
								class="text-primary-green"
							>
							<div>
								<div class="text-white font-medium">Price Prediction</div>
								<div class="text-sm text-text-secondary">Coming soon...</div>
							</div>
						</label>
					</div>
				</div>

				<div class="bg-primary-green/20 border border-primary-green/30 rounded-lg p-4">
					<h4 class="text-white font-medium mb-2">Quick Match Rules:</h4>
					<ul class="text-sm text-text-secondary space-y-1">
						<li>• Select up to 5 cryptocurrencies</li>
						<li>• 24-hour competition period</li>
						<li>• Real-time price tracking</li>
						<li>• Winners based on portfolio % gain</li>
					</ul>
				</div>
				
				<div class="flex gap-4">
					<button 
						onclick={() => showCreateModal = false}
						class="flex-1 border border-white/30 text-white hover:bg-white/10 py-3 rounded-lg transition-colors"
					>
						Cancel
					</button>
					<button 
						onclick={createGame}
						class="flex-1 bg-primary-green hover:bg-dark-green text-black py-3 rounded-lg transition-colors font-bold"
					>
						Create Game
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}