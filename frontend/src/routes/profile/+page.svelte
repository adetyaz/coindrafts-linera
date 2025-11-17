<script lang="ts">
	import { onMount } from 'svelte';
	import { coinDraftsService } from '$lib/coinDraftsService';
	import type { PlayerProfile, Tournament, Game } from '$lib/coinDraftsService';
	import { Gamepad2, Trophy, DollarSign, BarChart3, Zap, Target, Diamond, Lock } from '@lucide/svelte';

	let player: PlayerProfile | null = $state(null);
	let tournaments: Tournament[] = $state([]);
	let games: Game[] = $state([]);
	let loading = $state(true);
	
	// Mock player ID - in a real app, this would come from authentication
	const playerId = "player-demo-123";

	onMount(async () => {
		await loadPlayerData();
	});

	async function loadPlayerData() {
		try {
			loading = true;
			
			// Load player data and participating tournaments/games
			const [players, allTournaments, allGames] = await Promise.all([
				coinDraftsService.fetchPlayers(),
				coinDraftsService.fetchTournaments(),
				coinDraftsService.fetchGames()
			]);
			
			// Find current player (in real app, would be authenticated user)
			player = players.find(p => p.playerId === playerId) || players[0] || null;
			
			// Filter tournaments and games for this player (mock logic)
			tournaments = allTournaments.slice(0, 3); // Show recent tournaments
			games = allGames.slice(0, 4); // Show recent games
			
		} catch (error) {
			console.error('Error loading player data:', error);
		} finally {
			loading = false;
		}
	}

	function getTierColor(tier: string) {
		switch (tier.toLowerCase()) {
			case 'bronze': return 'text-primary-green';
			case 'silver': return 'text-gray-300';
			case 'gold': return 'text-primary-green';
			case 'platinum': return 'text-primary-green';
			case 'diamond': return 'text-primary-green';
			default: return 'text-gray-400';
		}
	}

	function getTierIcon(tier: string) {
		switch (tier.toLowerCase()) {
			case 'bronze': return Trophy;
			case 'silver': return Trophy;
			case 'gold': return Trophy;
			case 'platinum': return Diamond;
			case 'diamond': return Diamond;
			default: return Trophy;
		}
	}
</script>

<svelte:head>
	<title>Player Profile - CoinDrafts</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	{#if loading}
		<div class="text-center py-12">
			<div class="text-text-secondary text-lg">Loading player profile...</div>
		</div>
	{:else if !player}
		<div class="text-center py-12">
			<div class="text-4xl mb-4">👤</div>
			<h2 class="text-2xl font-bold text-white mb-4">Player Not Found</h2>
			<p class="text-text-secondary mb-8">No player data available. Play some games to create your profile!</p>
			<a href="/tournaments" class="bg-primary-green hover:bg-dark-green text-black font-bold py-3 px-6 rounded-full cursor-pointer">
				Browse Tournaments
			</a>
		</div>
	{:else}
		<!-- Player Header -->
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30 mb-8">
			<div class="flex flex-col md:flex-row items-center gap-6">
				<!-- Avatar -->
				<div class="w-24 h-24 rounded-full flex items-center justify-center text-4xl" style="background: linear-gradient(45deg, #8b5cf6, #3b82f6)">
					👤
				</div>
				
				<!-- Player Info -->
				<div class="text-center md:text-left">
					<h1 class="text-3xl font-bold text-white mb-2">{player.playerName}</h1>
					<div class="flex items-center justify-center md:justify-start gap-2 mb-4">
						<span class="text-2xl">{getTierIcon(player.tier)}</span>
						<span class="text-lg {getTierColor(player.tier)} font-semibold">{player.tier} Tier</span>
					</div>
					<p class="text-text-secondary">Player ID: {player.playerId}</p>
				</div>
				
				<!-- Quick Stats -->
				<div class="grid grid-cols-3 gap-6 ml-auto">
					<div class="text-center">
						<div class="text-2xl font-bold text-white">{player.stats.gamesPlayed}</div>
						<div class="text-sm text-text-secondary">Games Played</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-primary-green">{player.stats.gamesWon}</div>
						<div class="text-sm text-text-secondary">Games Won</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-primary-green">${player.stats.totalEarnings}</div>
						<div class="text-sm text-text-secondary">Total Earnings</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Stats Overview -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30 text-center">
				<div class="flex justify-center mb-2">
					<Gamepad2 class="w-8 h-8 text-primary-green" />
				</div>
				<div class="text-2xl font-bold text-white">{player.stats.gamesPlayed}</div>
				<div class="text-sm text-text-secondary">Total Games</div>
			</div>
			
			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30 text-center">
				<div class="flex justify-center mb-2">
					<Trophy class="w-8 h-8 text-primary-green" />
				</div>
				<div class="text-2xl font-bold text-primary-green">{player.stats.gamesWon}</div>
				<div class="text-sm text-text-secondary">Wins</div>
			</div>
			
			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30 text-center">
				<div class="flex justify-center mb-2">
					<DollarSign class="w-8 h-8 text-primary-green" />
				</div>
				<div class="text-2xl font-bold text-primary-green">${player.stats.totalEarnings}</div>
				<div class="text-sm text-text-secondary">Earnings</div>
			</div>
			
			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30 text-center">
				<div class="flex justify-center mb-2">
					<BarChart3 class="w-8 h-8 text-primary-green" />
				</div>
				<div class="text-2xl font-bold text-primary-green">
					{player.stats.gamesPlayed > 0 ? Math.round((player.stats.gamesWon / player.stats.gamesPlayed) * 100) : 0}%
				</div>
				<div class="text-sm text-text-secondary">Win Rate</div>
			</div>
		</div>

		<!-- Current Tournaments -->
		<div class="mb-8">
			<h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
				<Trophy class="w-8 h-8 text-primary-green" />
				Active Tournaments
			</h2>
			{#if tournaments.length === 0}
				<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30 text-center">
					<div class="flex justify-center mb-4">
						<Trophy class="w-16 h-16 text-primary-green" />
					</div>
					<h3 class="text-lg font-semibold text-white mb-2">No Active Tournaments</h3>
					<p class="text-text-secondary mb-4">You're not currently participating in any tournaments.</p>
					<a href="/tournaments" class="bg-primary-green hover:bg-dark-green text-black font-bold py-2 px-4 rounded-full cursor-pointer">
						Browse Tournaments
					</a>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each tournaments as tournament}
						<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30">
							<div class="flex justify-between items-start mb-4">
								<h3 class="text-lg font-semibold text-white">{tournament.name}</h3>
								<span class="text-xs px-2 py-1 bg-primary-green/20 text-primary-green rounded-full border border-primary-green/30">
									{tournament.status}
								</span>
							</div>
							
							<div class="space-y-2 text-sm text-text-secondary mb-4">
								<div class="flex justify-between">
									<span>Type:</span>
									<span class="text-white">{tournament.tournamentType}</span>
								</div>
								<div class="flex justify-between">
									<span>Round:</span>
									<span class="text-white">{tournament.currentRound}/{tournament.maxRounds}</span>
								</div>
								<div class="flex justify-between">
									<span>Players:</span>
									<span class="text-white">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
								</div>
							</div>
							
							<a href="/tournaments/{tournament.id}" class="block w-full bg-primary-green hover:bg-dark-green text-black text-center py-2 rounded-full transition-colors cursor-pointer">
								View Details
							</a>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Recent Games -->
		<div class="mb-8">
			<h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
				<Zap class="w-8 h-8 text-primary-green" />
				Recent Games
			</h2>
			{#if games.length === 0}
				<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30 text-center">
					<div class="flex justify-center mb-4">
						<Zap class="w-16 h-16 text-primary-green" />
					</div>
					<h3 class="text-lg font-semibold text-white mb-2">No Recent Games</h3>
					<p class="text-text-secondary mb-4">Start playing to see your game history here.</p>
					<a href="/quick-match" class="bg-primary-green hover:bg-dark-green text-black font-bold py-2 px-4 rounded-full cursor-pointer flex items-center gap-2 mx-auto w-fit">
						<Zap class="w-4 h-4" />
						Play Quick Match
					</a>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					{#each games as game}
						<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30">
							<div class="flex justify-between items-start mb-4">
								<div>
									<h3 class="text-lg font-semibold text-white">Game #{game.gameId.slice(-6)}</h3>
									<p class="text-sm text-text-secondary">{game.mode}</p>
								</div>
								<span class="text-xs px-2 py-1 rounded-full border {
									game.status === 'Active' ? 'bg-primary-green/20 text-primary-green border-primary-green/30' :
									game.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300 border-primary-green/30' :
									'bg-gray-500/20 text-gray-300 border-gray-500/30'
								}">
									{game.status}
								</span>
							</div>
							
							<div class="space-y-2 text-sm text-text-secondary mb-4">
								<div class="flex justify-between">
									<span>Players:</span>
									<span class="text-white">{game.playerCount}/{game.maxPlayers}</span>
								</div>
								<div class="flex justify-between">
									<span>Created:</span>
									<span class="text-white">{new Date(game.createdAt * 1000).toLocaleDateString()}</span>
								</div>
							</div>
							
							<a href="/games/{game.gameId}" class="block w-full bg-primary-green hover:bg-dark-green text-black text-center py-2 rounded-full transition-colors cursor-pointer">
								View Game
							</a>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Achievements/Badges -->
		<div class="mb-8">
			<h2 class="text-2xl font-bold text-white mb-6">🏅 Achievements</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				<!-- Mock achievements based on player stats -->
				{#if player.stats.gamesPlayed >= 1}
					<div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-primary-green/30 text-center">
						<div class="flex justify-center mb-2">
							<Gamepad2 class="w-6 h-6 text-primary-green" />
						</div>
						<div class="text-xs text-primary-green font-medium">First Game</div>
					</div>
				{/if}
				
				{#if player.stats.gamesWon >= 1}
					<div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-primary-green/30 text-center">
						<div class="flex justify-center mb-2">
							<Trophy class="w-6 h-6 text-primary-green" />
						</div>
						<div class="text-xs text-primary-green font-medium">First Win</div>
					</div>
				{/if}
				
				{#if player.stats.gamesPlayed >= 5}
					<div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-primary-green/30 text-center">
						<div class="flex justify-center mb-2">
							<Target class="w-6 h-6 text-primary-green" />
						</div>
						<div class="text-xs text-primary-green font-medium">Regular Player</div>
					</div>
				{/if}
				
				{#if player.stats.totalEarnings >= 100}
					<div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-primary-green/30 text-center">
						<div class="flex justify-center mb-2">
							<DollarSign class="w-6 h-6 text-primary-green" />
						</div>
						<div class="text-xs text-primary-green font-medium">High Earner</div>
					</div>
				{/if}
				
				<!-- Locked achievements -->
				<div class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border-color text-center opacity-50">
					<div class="flex justify-center mb-2">
						<Lock class="w-6 h-6 text-text-secondary" />
					</div>
					<div class="text-xs text-text-secondary font-medium">Win Streak</div>
				</div>
				
				<div class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-border-color text-center opacity-50">
					<div class="flex justify-center mb-2">
						<Lock class="w-6 h-6 text-text-secondary" />
					</div>
					<div class="text-xs text-text-secondary font-medium">Tournament Master</div>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="text-center">
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a href="/tournaments" class="bg-primary-green hover:bg-dark-green text-black font-bold py-3 px-6 rounded-full transition-colors cursor-pointer flex items-center gap-2 mx-auto w-fit">
					<Trophy class="w-5 h-5" />
					Join Tournament
				</a>
				<a href="/quick-match" class="bg-primary-green hover:bg-dark-green text-black font-bold py-3 px-6 rounded-full transition-colors cursor-pointer flex items-center gap-2 mx-auto w-fit">
					<Zap class="w-5 h-5" />
					Quick Match
				</a>
			</div>
		</div>
	{/if}
</div>