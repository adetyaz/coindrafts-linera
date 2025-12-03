<script lang="ts">
	import { onMount } from 'svelte';
	import { coinDraftsService } from '$lib/coinDraftsService';
	import type { PlayerProfile } from '$lib/coinDraftsService';
	import { TrendingUp, Trophy, Medal, Crown, Target, User, Filter } from '@lucide/svelte';
	import { wallet } from '$lib/stores/wallet';

	const walletState = $derived($wallet);

	let players: PlayerProfile[] = $state([]);
	let filteredPlayers: PlayerProfile[] = $state([]);
	let loading = $state(true);
	let selectedTier = $state('all');
	let sortBy = $state('earnings'); // 'earnings', 'wins', 'winRate'

	// Tier colors
	const tierConfig: Record<string, { color: string; bgColor: string; icon: string }> = {
		ROOKIE: { color: 'text-zinc-400', bgColor: 'bg-zinc-400/10', icon: '🔰' },
		BRONZE: { color: 'text-orange-600', bgColor: 'bg-orange-600/10', icon: '🥉' },
		SILVER: { color: 'text-gray-400', bgColor: 'bg-gray-400/10', icon: '🥈' },
		GOLD: { color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', icon: '🥇' },
		PLATINUM: { color: 'text-cyan-400', bgColor: 'bg-cyan-400/10', icon: '💎' },
		DIAMOND: { color: 'text-blue-500', bgColor: 'bg-blue-500/10', icon: '💠' },
		MASTER: { color: 'text-purple-500', bgColor: 'bg-purple-500/10', icon: '👑' },
		GRANDMASTER: { color: 'text-primary-green', bgColor: 'bg-primary-green/10', icon: '⚡' }
	};

	onMount(async () => {
		await loadLeaderboard();
	});

	async function loadLeaderboard() {
		try {
			loading = true;
			players = await coinDraftsService.fetchPlayers();
			applyFiltersAndSort();
		} catch (error) {
			console.error('Error loading leaderboard:', error);
		} finally {
			loading = false;
		}
	}

	function applyFiltersAndSort() {
		// Filter by tier
		let filtered = players;
		if (selectedTier !== 'all') {
			filtered = players.filter(p => p.tier === selectedTier);
		}

		// Sort
		filtered = [...filtered].sort((a, b) => {
			if (sortBy === 'earnings') {
				return (b.totalEarningsUsdc || 0) - (a.totalEarningsUsdc || 0);
			} else if (sortBy === 'wins') {
				return b.stats.gamesWon - a.stats.gamesWon;
			} else if (sortBy === 'winRate') {
				const aRate = a.stats.gamesPlayed > 0 ? a.stats.gamesWon / a.stats.gamesPlayed : 0;
				const bRate = b.stats.gamesPlayed > 0 ? b.stats.gamesWon / b.stats.gamesPlayed : 0;
				return bRate - aRate;
			}
			return 0;
		});

		filteredPlayers = filtered;
	}

	function calculateWinRate(player: PlayerProfile): number {
		if (player.stats.gamesPlayed === 0) return 0;
		return (player.stats.gamesWon / player.stats.gamesPlayed) * 100;
	}

	function getTierInfo(tier: string) {
		return tierConfig[tier] || tierConfig.ROOKIE;
	}

	function getRankIcon(rank: number) {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return `#${rank}`;
	}

	function getRankColor(rank: number) {
		if (rank === 1) return 'text-yellow-500';
		if (rank === 2) return 'text-gray-400';
		if (rank === 3) return 'text-orange-600';
		return 'text-text-secondary';
	}

	function isCurrentPlayer(account: string): boolean {
		return walletState.chainId === account;
	}

	$effect(() => {
		// Reapply filters when sort or tier changes
		applyFiltersAndSort();
	});
</script>

<svelte:head>
	<title>Leaderboard - CoinDrafts</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-4xl font-bold text-white mb-2 flex items-center gap-3">
			<TrendingUp class="w-10 h-10 text-primary-green" />
			Global Leaderboard
		</h1>
		<p class="text-text-secondary">Top players ranked by performance and earnings</p>
	</div>

	<!-- Filters -->
	<div class="bg-bg-accent border border-border-color rounded-lg p-6 mb-6">
		<div class="flex flex-col md:flex-row gap-4">
			<!-- Tier Filter -->
			<div class="flex-1">
				<label for="tierFilter" class="block text-sm font-medium text-white mb-2 flex items-center gap-2">
					<Filter class="w-4 h-4" />
					Filter by Tier
				</label>
				<select
					id="tierFilter"
					bind:value={selectedTier}
					class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-primary-green focus:outline-none"
				>
					<option value="all">All Tiers</option>
					<option value="ROOKIE">🔰 Rookie</option>
					<option value="BRONZE">🥉 Bronze</option>
					<option value="SILVER">🥈 Silver</option>
					<option value="GOLD">🥇 Gold</option>
					<option value="PLATINUM">💎 Platinum</option>
					<option value="DIAMOND">💠 Diamond</option>
					<option value="MASTER">👑 Master</option>
					<option value="GRANDMASTER">⚡ Grandmaster</option>
				</select>
			</div>

			<!-- Sort By -->
			<div class="flex-1">
				<label for="sortBy" class="block text-sm font-medium text-white mb-2 flex items-center gap-2">
					<TrendingUp class="w-4 h-4" />
					Sort By
				</label>
				<select
					id="sortBy"
					bind:value={sortBy}
					class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-primary-green focus:outline-none"
				>
					<option value="earnings">Total Earnings</option>
					<option value="wins">Games Won</option>
					<option value="winRate">Win Rate</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Leaderboard -->
	{#if loading}
		<div class="flex justify-center items-center min-h-[40vh]">
			<div class="text-center">
				<div class="w-16 h-16 border-4 border-primary-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
				<p class="text-text-secondary">Loading leaderboard...</p>
			</div>
		</div>
	{:else if filteredPlayers.length === 0}
		<div class="text-center py-12 bg-bg-accent border border-border-color rounded-lg">
			<Trophy class="w-16 h-16 text-zinc-700 mx-auto mb-4" />
			<p class="text-text-secondary mb-2">No players found</p>
			<p class="text-sm text-zinc-600">Be the first to join and compete!</p>
		</div>
	{:else}
		<!-- Top 3 Podium -->
		{#if filteredPlayers.length >= 3 && selectedTier === 'all'}
			<div class="grid grid-cols-3 gap-4 mb-8">
				<!-- 2nd Place -->
				<div class="pt-12">
					<div class="bg-gradient-to-b from-gray-500/20 to-bg-accent border-2 border-gray-400 rounded-lg p-6 text-center">
						<div class="text-4xl mb-2">🥈</div>
						<div class="w-16 h-16 rounded-full bg-gray-400/10 border-2 border-gray-400 flex items-center justify-center mx-auto mb-3">
							<User class="w-8 h-8 text-gray-400" />
						</div>
						<h3 class="text-lg font-bold text-white mb-1">{filteredPlayers[1].name}</h3>
						<div class="inline-flex items-center gap-1 px-2 py-1 rounded-full {getTierInfo(filteredPlayers[1].tier).bgColor} mb-2">
							<span class="text-xs {getTierInfo(filteredPlayers[1].tier).color}">{filteredPlayers[1].tier}</span>
						</div>
						<p class="text-2xl font-bold text-primary-green">${(filteredPlayers[1].totalEarningsUsdc || 0).toFixed(2)}</p>
						<p class="text-sm text-text-secondary">{filteredPlayers[1].stats.gamesWon} wins</p>
					</div>
				</div>

				<!-- 1st Place -->
				<div>
					<div class="bg-gradient-to-b from-yellow-500/20 to-bg-accent border-2 border-yellow-500 rounded-lg p-6 text-center">
						<div class="text-5xl mb-2">👑</div>
						<div class="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500 flex items-center justify-center mx-auto mb-3">
							<Crown class="w-10 h-10 text-yellow-500" />
						</div>
						<h3 class="text-xl font-bold text-white mb-1">{filteredPlayers[0].name}</h3>
						<div class="inline-flex items-center gap-1 px-2 py-1 rounded-full {getTierInfo(filteredPlayers[0].tier).bgColor} mb-2">
							<span class="text-xs {getTierInfo(filteredPlayers[0].tier).color}">{filteredPlayers[0].tier}</span>
						</div>
						<p class="text-3xl font-bold text-primary-green">${(filteredPlayers[0].totalEarningsUsdc || 0).toFixed(2)}</p>
						<p class="text-sm text-text-secondary">{filteredPlayers[0].stats.gamesWon} wins</p>
					</div>
				</div>

				<!-- 3rd Place -->
				<div class="pt-12">
					<div class="bg-gradient-to-b from-orange-600/20 to-bg-accent border-2 border-orange-600 rounded-lg p-6 text-center">
						<div class="text-4xl mb-2">🥉</div>
						<div class="w-16 h-16 rounded-full bg-orange-600/10 border-2 border-orange-600 flex items-center justify-center mx-auto mb-3">
							<User class="w-8 h-8 text-orange-600" />
						</div>
						<h3 class="text-lg font-bold text-white mb-1">{filteredPlayers[2].name}</h3>
						<div class="inline-flex items-center gap-1 px-2 py-1 rounded-full {getTierInfo(filteredPlayers[2].tier).bgColor} mb-2">
							<span class="text-xs {getTierInfo(filteredPlayers[2].tier).color}">{filteredPlayers[2].tier}</span>
						</div>
						<p class="text-2xl font-bold text-primary-green">${(filteredPlayers[2].totalEarningsUsdc || 0).toFixed(2)}</p>
						<p class="text-sm text-text-secondary">{filteredPlayers[2].stats.gamesWon} wins</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Full Leaderboard Table -->
		<div class="bg-bg-accent border border-border-color rounded-lg overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-border-color bg-zinc-900">
							<th class="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Rank</th>
							<th class="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Player</th>
							<th class="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tier</th>
							<th class="px-6 py-4 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Games</th>
							<th class="px-6 py-4 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Wins</th>
							<th class="px-6 py-4 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Win Rate</th>
							<th class="px-6 py-4 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Earnings</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border-color">
						{#each filteredPlayers as player, index}
							<tr class="hover:bg-zinc-800/50 transition-colors {isCurrentPlayer(player.account) ? 'bg-primary-green/5 border-l-4 border-primary-green' : ''}">
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-xl font-bold {getRankColor(index + 1)}">
										{getRankIcon(index + 1)}
									</span>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										<div class="w-10 h-10 rounded-full bg-primary-green/10 border border-primary-green flex items-center justify-center">
											<User class="w-5 h-5 text-primary-green" />
										</div>
										<div>
											<div class="text-white font-medium flex items-center gap-2">
												{player.name}
												{#if isCurrentPlayer(player.account)}
													<span class="text-xs px-2 py-0.5 rounded-full bg-primary-green/20 text-primary-green">You</span>
												{/if}
											</div>
											<div class="text-text-secondary text-xs font-mono">
												{player.account.slice(0, 6)}...{player.account.slice(-4)}
											</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4">
									<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full {getTierInfo(player.tier).bgColor} border border-current {getTierInfo(player.tier).color}">
										<span>{getTierInfo(player.tier).icon}</span>
										<span class="text-xs font-medium">{player.tier}</span>
									</span>
								</td>
								<td class="px-6 py-4 text-right">
									<span class="text-white font-medium">{player.stats.gamesPlayed}</span>
								</td>
								<td class="px-6 py-4 text-right">
									<span class="text-white font-medium">{player.stats.gamesWon}</span>
								</td>
								<td class="px-6 py-4 text-right">
									<span class="text-white font-medium">{calculateWinRate(player).toFixed(1)}%</span>
								</td>
								<td class="px-6 py-4 text-right">
									<span class="text-primary-green font-bold text-lg">${(player.totalEarningsUsdc || 0).toFixed(2)}</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Stats Summary -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
			<div class="bg-bg-accent border border-border-color rounded-lg p-6 text-center">
				<Trophy class="w-8 h-8 text-primary-green mx-auto mb-2" />
				<p class="text-2xl font-bold text-white">{filteredPlayers.length}</p>
				<p class="text-sm text-text-secondary">Total Players</p>
			</div>
			<div class="bg-bg-accent border border-border-color rounded-lg p-6 text-center">
				<Target class="w-8 h-8 text-primary-green mx-auto mb-2" />
				<p class="text-2xl font-bold text-white">
					{filteredPlayers.reduce((sum, p) => sum + p.stats.gamesPlayed, 0)}
				</p>
				<p class="text-sm text-text-secondary">Total Games Played</p>
			</div>
			<div class="bg-bg-accent border border-border-color rounded-lg p-6 text-center">
				<Medal class="w-8 h-8 text-primary-green mx-auto mb-2" />
				<p class="text-2xl font-bold text-primary-green">
					${filteredPlayers.reduce((sum, p) => sum + (p.totalEarningsUsdc || 0), 0).toFixed(2)}
				</p>
				<p class="text-sm text-text-secondary">Total Prizes Awarded</p>
			</div>
		</div>
	{/if}
</div>
