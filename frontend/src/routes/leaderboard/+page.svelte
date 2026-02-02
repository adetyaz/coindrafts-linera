<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchLeaderboard, type LeaderboardEntry } from '$lib/services/profileService';
	import { TrendingUp, Trophy, Medal, Crown, Target, User, Filter } from '@lucide/svelte';
	import { wallet } from '$lib/stores/wallet';

	const walletState = $derived($wallet);

	let leaderboard: LeaderboardEntry[] = $state([]);
	let loading = $state(true);
	let selectedTier = $state<string | undefined>(undefined);
	let sortBy = $state('earnings');

	const tiers = [
		'All',
		'Rookie',
		'Bronze',
		'Silver',
		'Gold',
		'Platinum',
		'Diamond',
		'Master',
		'Grandmaster'
	];

	// Tier colors
	const tierConfig: Record<string, { color: string; bgColor: string; icon: string }> = {
		Rookie: { color: 'text-zinc-400', bgColor: 'bg-zinc-400/10', icon: '🔰' },
		Bronze: { color: 'text-orange-600', bgColor: 'bg-orange-600/10', icon: '🥉' },
		Silver: { color: 'text-gray-400', bgColor: 'bg-gray-400/10', icon: '🥈' },
		Gold: { color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', icon: '🥇' },
		Platinum: { color: 'text-cyan-400', bgColor: 'bg-cyan-400/10', icon: '💎' },
		Diamond: { color: 'text-blue-500', bgColor: 'bg-blue-500/10', icon: '💠' },
		Master: { color: 'text-purple-500', bgColor: 'bg-purple-500/10', icon: '👑' },
		Grandmaster: { color: 'text-primary-green', bgColor: 'bg-primary-green/10', icon: '⚡' }
	};

	onMount(async () => {
		await loadLeaderboard();
	});

	async function loadLeaderboard() {
		try {
			loading = true;
			const tierParam =
				selectedTier && selectedTier !== 'All' ? selectedTier.toUpperCase() : undefined;
			leaderboard = await fetchLeaderboard(tierParam as any, 100);
		} finally {
			loading = false;
		}
	}

	function handleTierChange(tier: string) {
		selectedTier = tier === 'All' ? undefined : tier;
		loadLeaderboard();
	}

	function getTierInfo(tier: string) {
		return tierConfig[tier] || tierConfig.Rookie;
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

	function formatUsdc(microUsdc: number): string {
		return (microUsdc / 1_000_000).toFixed(2);
	}
</script>

<svelte:head>
	<title>Leaderboard - CoinDrafts</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="mb-2 flex items-center gap-3 text-4xl font-bold text-white">
			<TrendingUp class="text-primary-green h-10 w-10" />
			Global Leaderboard
		</h1>
		<p class="text-text-secondary">Top players ranked by performance and earnings</p>
	</div>

	<!-- Filters -->
	<div class="bg-bg-accent border-border-color mb-6 rounded-lg border p-6">
		<div class="flex flex-col gap-4 md:flex-row">
			<!-- Tier Filter -->
			<div class="flex-1">
				<label for="tierFilter" class="mb-2 flex items-center gap-2 text-sm font-medium text-white">
					<Filter class="h-4 w-4" />
					Filter by Tier
				</label>
				<select
					id="tierFilter"
					bind:value={selectedTier}
					class="focus:border-primary-green w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:outline-none"
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
				<label for="sortBy" class="mb-2 flex items-center gap-2 text-sm font-medium text-white">
					<TrendingUp class="h-4 w-4" />
					Sort By
				</label>
				<select
					id="sortBy"
					bind:value={sortBy}
					class="focus:border-primary-green w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:outline-none"
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
		<div class="flex min-h-[40vh] items-center justify-center">
			<div class="text-center">
				<div
					class="border-primary-green mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
				></div>
				<p class="text-text-secondary">Loading leaderboard...</p>
			</div>
		</div>
	{:else if leaderboard.length === 0}
		<div class="bg-bg-accent border-border-color rounded-lg border py-12 text-center">
			<Trophy class="mx-auto mb-4 h-16 w-16 text-zinc-700" />
			<p class="text-text-secondary mb-2">No players found</p>
			<p class="text-sm text-zinc-600">Be the first to join and compete!</p>
		</div>
	{:else}
		<!-- Full Leaderboard Table -->
		<div class="bg-bg-accent border-border-color overflow-hidden rounded-lg border">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-border-color border-b bg-zinc-900">
							<th
								class="text-text-secondary px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
								>Rank</th
							>
							<th
								class="text-text-secondary px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
								>Player</th
							>
							<th
								class="text-text-secondary px-6 py-4 text-left text-xs font-medium tracking-wider uppercase"
								>Tier</th
							>
							<th
								class="text-text-secondary px-6 py-4 text-right text-xs font-medium tracking-wider uppercase"
								>Games</th
							>
							<th
								class="text-text-secondary px-6 py-4 text-right text-xs font-medium tracking-wider uppercase"
								>Wins</th
							>
							<th
								class="text-text-secondary px-6 py-4 text-right text-xs font-medium tracking-wider uppercase"
								>Win Rate</th
							>
							<th
								class="text-text-secondary px-6 py-4 text-right text-xs font-medium tracking-wider uppercase"
								>Earnings</th
							>
						</tr>
					</thead>
					<tbody class="divide-border-color divide-y">
						{#each leaderboard as entry}
							<tr
								class="transition-colors hover:bg-zinc-800/50 {isCurrentPlayer(entry.playerAccount)
									? 'bg-primary-green/5 border-primary-green border-l-4'
									: ''}"
							>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="text-xl font-bold {getRankColor(entry.rank)}">
										{getRankIcon(entry.rank)}
									</span>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										<div
											class="bg-primary-green/10 border-primary-green flex h-10 w-10 items-center justify-center rounded-full border"
										>
											<User class="text-primary-green h-5 w-5" />
										</div>
										<div>
											<div class="flex items-center gap-2 font-medium text-white">
												<a href="/profile/{entry.playerAccount}" class="hover:text-primary-green">
													{entry.playerName}
												</a>
												{#if isCurrentPlayer(entry.playerAccount)}
													<span
														class="bg-primary-green/20 text-primary-green rounded-full px-2 py-0.5 text-xs"
														>You</span
													>
												{/if}
											</div>
											<div class="text-text-secondary font-mono text-xs">
												{entry.playerAccount.slice(0, 6)}...{entry.playerAccount.slice(-4)}
											</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4">
									<span
										class="inline-flex items-center gap-1 rounded-full px-3 py-1 {getTierInfo(
											entry.currentTier
										).bgColor} border border-current {getTierInfo(entry.currentTier).color}"
									>
										<span>{getTierInfo(entry.currentTier).icon}</span>
										<span class="text-xs font-medium">{entry.currentTier}</span>
									</span>
								</td>
								<td class="px-6 py-4 text-right">
									<span class="font-medium text-white">{entry.totalGamesPlayed}</span>
								</td>
								<td class="px-6 py-4 text-right">
									<span class="font-medium text-white">{entry.totalWins}</span>
								</td>
								<td class="px-6 py-4 text-right">
									<span class="font-medium text-white">{entry.winRate}%</span>
								</td>
								<td class="px-6 py-4 text-right">
									<span class="text-primary-green text-lg font-bold"
										>${formatUsdc(entry.totalEarningsUsdc)}</span
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Stats Summary -->
		<div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
			<div class="bg-bg-accent border-border-color rounded-lg border p-6 text-center">
				<Trophy class="text-primary-green mx-auto mb-2 h-8 w-8" />
				<p class="text-2xl font-bold text-white">{leaderboard.length}</p>
				<p class="text-text-secondary text-sm">Total Players</p>
			</div>
			<div class="bg-bg-accent border-border-color rounded-lg border p-6 text-center">
				<Target class="text-primary-green mx-auto mb-2 h-8 w-8" />
				<p class="text-2xl font-bold text-white">
					{leaderboard.reduce((sum, p) => sum + p.totalGamesPlayed, 0)}
				</p>
				<p class="text-text-secondary text-sm">Total Games Played</p>
			</div>
			<div class="bg-bg-accent border-border-color rounded-lg border p-6 text-center">
				<Medal class="text-primary-green mx-auto mb-2 h-8 w-8" />
				<p class="text-primary-green text-2xl font-bold">
					${leaderboard.reduce((sum, p) => sum + p.totalEarningsUsdc, 0) / 1_000_000}
				</p>
				<p class="text-text-secondary text-sm">Total Prizes Awarded</p>
			</div>
		</div>
	{/if}
</div>
