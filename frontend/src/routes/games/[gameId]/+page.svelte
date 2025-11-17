<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { coinDraftsService, type Game, type PlayerProfile, type Portfolio } from '$lib/coinDraftsService';
	import { Trophy, Users, DollarSign, Calendar, Gamepad2, ArrowLeft, Target } from '@lucide/svelte';

	const gameId = page.params.gameId;
	
	let game = $state<Game | null>(null);
	let players = $state<PlayerProfile[]>([]);
	let portfolios = $state<Portfolio[]>([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		await loadGameDetails();
	});

	async function loadGameDetails() {
		try {
			loading = true;
			error = '';
			
			if (!gameId) {
				error = 'Invalid game ID';
				return;
			}
			
			// Load game details
			game = await coinDraftsService.fetchGame(gameId);
			
			if (!game) {
				error = 'Game not found';
				return;
			}

			// Load players and portfolios
			players = await coinDraftsService.fetchPlayers();
			portfolios = await coinDraftsService.fetchPortfolios(gameId);
			
		} catch (err) {
			console.error('Failed to load game details:', err);
			error = 'Failed to load game details';
		} finally {
			loading = false;
		}
	}

	async function joinGame() {
		try {
			if (!gameId) {
				error = 'Invalid game ID';
				return;
			}
			const result = await coinDraftsService.registerPlayer(gameId, 'current-user');
			if (result.success) {
				await loadGameDetails(); // Refresh data
			} else {
				error = 'Failed to join game';
			}
		} catch (err) {
			console.error('Failed to join game:', err);
			error = 'Failed to join game';
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'WaitingForPlayers': return 'text-green-400';
			case 'Active': return 'text-yellow-400';
			case 'Completed': return 'text-blue-400';
			default: return 'text-gray-400';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'WaitingForPlayers': return Users;
			case 'Active': return Target;
			case 'Completed': return Trophy;
			default: return Calendar;
		}
	}

	function getModeDisplayName(mode: string): string {
		switch (mode) {
			case 'QUICK_MATCH': return 'Quick Match';
			case 'TRADITIONAL_LEAGUE': return 'Traditional League';
			case 'PRICE_PREDICTION': return 'Price Prediction';
			default: return mode;
		}
	}
</script>

<div class="min-h-screen bg-black text-green-400 p-6">
	<div class="max-w-4xl mx-auto">
		<!-- Header with Back Button -->
		<div class="flex items-center gap-4 mb-8">
			<a href="/quick-match" class="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors">
				<ArrowLeft size={20} />
				Back to Games
			</a>
		</div>

		{#if loading}
			<div class="flex justify-center items-center py-20">
				<div class="text-green-400 text-xl">Loading game details...</div>
			</div>
		{:else if error}
			<div class="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
				<div class="text-red-400 text-xl mb-4">{error}</div>
				<button 
					onclick={loadGameDetails}
					class="bg-green-600 hover:bg-green-700 text-black px-6 py-2 rounded-full font-semibold transition-colors cursor-pointer"
				>
					Retry
				</button>
			</div>
		{:else if game}
			<!-- Game Header -->
			<div class="bg-gray-900 rounded-lg p-6 mb-8 border border-green-500/20">
				<div class="flex items-start justify-between mb-4">
					<div>
						<h1 class="text-3xl font-bold text-green-400 mb-2">Game {game.gameId}</h1>
						<div class="flex items-center gap-2 text-lg">
							{#if game.status === 'WaitingForPlayers'}
								<Users size={20} />
							{:else if game.status === 'Active'}
								<Target size={20} />
							{:else if game.status === 'Completed'}
								<Trophy size={20} />
							{:else}
								<Calendar size={20} />
							{/if}
							<span class={getStatusColor(game.status)}>{game.status}</span>
						</div>
					</div>
					
					{#if game.status === 'WaitingForPlayers'}
						<button 
							onclick={joinGame}
							class="bg-green-600 hover:bg-green-700 text-black px-6 py-3 rounded-full font-semibold transition-colors cursor-pointer flex items-center gap-2"
						>
							<Users size={20} />
							Join Game
						</button>
					{/if}
				</div>

				<!-- Game Details Grid -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="flex items-center gap-3 bg-black/30 rounded-lg p-4">
						<Gamepad2 size={24} class="text-green-400" />
						<div>
							<div class="text-sm text-gray-400">Game Mode</div>
							<div class="text-lg font-semibold">{getModeDisplayName(game.mode)}</div>
						</div>
					</div>

					<div class="flex items-center gap-3 bg-black/30 rounded-lg p-4">
						<Users size={24} class="text-green-400" />
						<div>
							<div class="text-sm text-gray-400">Players</div>
							<div class="text-lg font-semibold">{game.playerCount || 0}</div>
						</div>
					</div>

					<div class="flex items-center gap-3 bg-black/30 rounded-lg p-4">
						<Calendar size={24} class="text-green-400" />
						<div>
							<div class="text-sm text-gray-400">Created</div>
							<div class="text-lg font-semibold">
								{#if game.createdAt}
									{(() => {
										console.log('Raw createdAt value:', game.createdAt, 'Type:', typeof game.createdAt);
										// The timestamp might be in nanoseconds or microseconds, let's try different divisions
										const timestamp = typeof game.createdAt === 'string' ? parseInt(game.createdAt) : game.createdAt;
										if (isNaN(timestamp)) return 'Unknown';
										
										// Try different timestamp formats
										const formats = [
											timestamp,           // milliseconds
											timestamp / 1000,    // seconds
											timestamp / 1000000, // microseconds
											timestamp / 1000000000 // nanoseconds
										];
										
										for (const ts of formats) {
											const date = new Date(ts);
											if (date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
												return date.toLocaleDateString();
											}
										}
										
										return `Debug: ${timestamp}`;
									})()}
								{:else}
									Unknown
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Players Section -->
			<div class="bg-gray-900 rounded-lg p-6 mb-8 border border-green-500/20">
				<h2 class="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
					<Users size={24} />
					Players ({players.length})
				</h2>
				
				{#if players.length > 0}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{#each players as player, index}
							<div class="bg-black/30 rounded-lg p-3 flex items-center gap-3">
								<div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-black font-bold">
									{index + 1}
								</div>
								<div class="truncate">{player.playerName}</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8 text-gray-400">
						No players yet. Be the first to join!
					</div>
				{/if}
			</div>

			<!-- Portfolios Section -->
			{#if portfolios.length > 0}
				<div class="bg-gray-900 rounded-lg p-6 border border-green-500/20">
					<h2 class="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
						<DollarSign size={24} />
						Portfolios ({portfolios.length})
					</h2>
					
					<div class="space-y-4">
						{#each portfolios as portfolio, index}
							<div class="bg-black/30 rounded-lg p-4">
								<div class="flex items-center justify-between mb-3">
									<div class="flex items-center gap-3">
										<div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-black font-bold text-sm">
											{index + 1}
										</div>
										<div class="font-semibold">{portfolio.playerId}</div>
									</div>
									<div class="text-green-400 font-semibold">
										Status: {portfolio.status}
									</div>
								</div>
								
								{#if portfolio.cryptocurrencies && portfolio.cryptocurrencies.length > 0}
									<div class="flex flex-wrap gap-2">
										{#each portfolio.cryptocurrencies as crypto}
											<span class="bg-green-600/20 text-green-400 px-2 py-1 rounded text-sm">
												{crypto}
											</span>
										{/each}
									</div>
								{:else}
									<div class="text-gray-400 text-sm">No cryptocurrencies selected</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>