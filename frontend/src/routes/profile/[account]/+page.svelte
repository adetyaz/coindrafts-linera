<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { fetchPlayerProfile, type PlayerStats } from '$lib/services/profileService';
	import { wallet } from '$lib/stores/wallet';

	const account = page.params.account || '';
	let profile: PlayerStats | null = null;
	let loading = true;
	let isOwnProfile = false;

	onMount(async () => {
		if (!account) {
			loading = false;
			return;
		}
		isOwnProfile = $wallet && $wallet.chainId === account;
		profile = await fetchPlayerProfile(account);
		loading = false;
	});

	function formatUsdc(microUsdc: number): string {
		return (microUsdc / 1_000_000).toFixed(2);
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp / 1000).toLocaleDateString();
	}

	function getTierColor(tier: string): string {
		const colors: Record<string, string> = {
			Rookie: 'text-gray-400',
			Bronze: 'text-orange-700',
			Silver: 'text-gray-300',
			Gold: 'text-yellow-500',
			Platinum: 'text-purple-400',
			Diamond: 'text-blue-400',
			Master: 'text-purple-600',
			Grandmaster: 'text-red-500'
		};
		return colors[tier] || 'text-gray-400';
	}

	function getAchievementIcon(type: string): string {
		const icons: Record<string, string> = {
			FirstWin: '🏆',
			Play10Games: '🎮',
			Play50Games: '🎯',
			WinStreak3: '🔥',
			PerfectPortfolio: '💎',
			RisingStar: '⭐',
			Legend: '👑'
		};
		return icons[type] || '🏅';
	}

	function getAchievementName(type: string): string {
		const names: Record<string, string> = {
			FirstWin: 'First Victory',
			Play10Games: 'Rookie Veteran',
			Play50Games: 'Seasoned Player',
			WinStreak3: 'Hot Streak',
			PerfectPortfolio: 'Perfect Portfolio',
			RisingStar: 'Rising Star',
			Legend: 'Legendary Trader'
		};
		return names[type] || type;
	}
</script>

{#if loading}
	<div class="flex min-h-screen items-center justify-center">
		<p class="text-xl">Loading profile...</p>
	</div>
{:else if !profile}
	<div class="mx-auto max-w-4xl p-8">
		<p class="text-xl text-red-500">Player profile not found</p>
	</div>
{:else}
	<div class="mx-auto max-w-6xl p-8">
		<!-- Header -->
		<div class="mb-6 rounded-lg bg-gray-800 p-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="mb-2 text-3xl font-bold">
						{isOwnProfile ? 'Your Profile' : 'Player Profile'}
					</h1>
					<p class="font-mono text-sm text-gray-400">
						{account ? `${account.slice(0, 12)}...${account.slice(-8)}` : ''}
					</p>
				</div>
				<div class="text-right">
					<p class="text-5xl font-bold {getTierColor(profile.currentTier)}">
						{profile.currentTier}
					</p>
					<p class="text-sm text-gray-400">Current Tier</p>
				</div>
			</div>
		</div>

		<!-- Stats Grid -->
		<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
			<div class="rounded-lg bg-gray-800 p-4">
				<p class="mb-1 text-sm text-gray-400">Total Games</p>
				<p class="text-2xl font-bold">{profile.totalGamesPlayed}</p>
			</div>
			<div class="rounded-lg bg-gray-800 p-4">
				<p class="mb-1 text-sm text-gray-400">Total Wins</p>
				<p class="text-2xl font-bold text-green-500">{profile.totalWins}</p>
			</div>
			<div class="rounded-lg bg-gray-800 p-4">
				<p class="mb-1 text-sm text-gray-400">Win Rate</p>
				<p class="text-2xl font-bold">
					{profile.totalGamesPlayed > 0
						? ((profile.totalWins / profile.totalGamesPlayed) * 100).toFixed(1)
						: 0}%
				</p>
			</div>
			<div class="rounded-lg bg-gray-800 p-4">
				<p class="mb-1 text-sm text-gray-400">Total Earnings</p>
				<p class="text-2xl font-bold text-yellow-500">
					${formatUsdc(profile.totalEarningsUsdc)}
				</p>
			</div>
		</div>

		<!-- Achievements -->
		<div class="mb-6 rounded-lg bg-gray-800 p-6">
			<h2 class="mb-4 text-2xl font-bold">
				Achievements ({profile.achievementsUnlocked.length})
			</h2>
			{#if profile.achievementsUnlocked.length > 0}
				<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
					{#each profile.achievementsUnlocked as achievement}
						<div class="rounded-lg bg-gray-700 p-4 text-center">
							<div class="mb-2 text-4xl">
								{getAchievementIcon(achievement.achievementType)}
							</div>
							<p class="text-sm font-semibold">
								{getAchievementName(achievement.achievementType)}
							</p>
							<p class="mt-1 text-xs text-gray-400">
								{formatDate(achievement.unlockedAt)}
							</p>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-400">No achievements unlocked yet. Keep playing!</p>
			{/if}
		</div>

		<!-- Recent Games -->
		<div class="rounded-lg bg-gray-800 p-6">
			<h2 class="mb-4 text-2xl font-bold">Recent Games</h2>
			{#if profile.recentGames.length > 0}
				<div class="space-y-3">
					{#each profile.recentGames as game}
						<div class="flex items-center justify-between rounded-lg bg-gray-700 p-4">
							<div class="flex items-center space-x-4">
								<div
									class="text-2xl font-bold {game.rank === 1
										? 'text-yellow-500'
										: game.rank === 2
											? 'text-gray-300'
											: game.rank === 3
												? 'text-orange-700'
												: 'text-gray-400'}"
								>
									#{game.rank}
								</div>
								<div>
									<p class="font-mono text-sm text-gray-400">
										{game.gameId.slice(0, 15)}...
									</p>
									<p class="text-xs text-gray-500">{formatDate(game.playedAt)}</p>
								</div>
							</div>
							<div class="text-right">
								<p class="font-bold {game.portfolioReturn > 0 ? 'text-green-500' : 'text-red-500'}">
									{(game.portfolioReturn / 100).toFixed(2)}%
								</p>
								<p class="text-sm text-gray-400">Prize: ${formatUsdc(game.prizeWon)}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-400">No games played yet.</p>
			{/if}
		</div>
	</div>
{/if}
