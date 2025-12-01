<script lang="ts">
	import { formatPrice } from '$lib/services/priceService';

	interface LeaderboardEntry {
		rank: number;
		playerAccount: string;
		playerName?: string;
		totalReturn: number;
		returnPercent: number;
		portfolioValue: number;
		prize: number;
	}

	interface PriceChange {
		symbol: string;
		name: string;
		startPrice: number;
		endPrice: number;
		changePercent: number;
	}

	interface Props {
		gameId: string;
		gameMode: 'quick' | 'tournament';
		leaderboard: LeaderboardEntry[];
		priceChanges: PriceChange[];
		totalPrizePool: number;
		gameStatus: 'active' | 'completed';
		startTime: number;
		endTime?: number;
	}

	let {
		gameId,
		gameMode,
		leaderboard,
		priceChanges,
		totalPrizePool,
		gameStatus,
		startTime,
		endTime
	}: Props = $props();

	function formatPercent(value: number): string {
		const sign = value >= 0 ? '+' : '';
		return `${sign}${value.toFixed(2)}%`;
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleString();
	}

	function getRankColor(rank: number): string {
		if (rank === 1) return 'text-yellow-400';
		if (rank === 2) return 'text-gray-300';
		if (rank === 3) return 'text-orange-400';
		return 'text-gray-400';
	}

	function getRankMedal(rank: number): string {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return `${rank}`;
	}
</script>

<div class="game-results bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
	<!-- Header -->
	<div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
		<div class="flex items-center justify-between mb-2">
			<h2 class="text-2xl font-bold">
				{gameMode === 'tournament' ? 'Tournament' : 'Quick Match'} Results
			</h2>
			<div
				class="px-3 py-1 rounded-full text-sm font-semibold"
				class:bg-green-500={gameStatus === 'completed'}
				class:bg-blue-500={gameStatus === 'active'}
			>
				{gameStatus === 'completed' ? 'Completed' : 'In Progress'}
			</div>
		</div>
		<div class="text-sm opacity-90">
			<div>Game ID: <span class="font-mono">{gameId}</span></div>
			<div>Started: {formatDate(startTime)}</div>
			{#if endTime}
				<div>Ended: {formatDate(endTime)}</div>
			{/if}
		</div>
	</div>

	<!-- Prize Pool -->
	<div class="bg-gray-800 p-4 border-b border-gray-700">
		<div class="text-center">
			<div class="text-sm text-gray-400 mb-1">Total Prize Pool</div>
			<div class="text-3xl font-bold text-green-400">{formatPrice(totalPrizePool)}</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
		<!-- Leaderboard -->
		<div>
			<h3 class="text-xl font-bold mb-4 flex items-center gap-2">
				<span>🏆</span>
				<span>Leaderboard</span>
			</h3>

			{#if leaderboard.length === 0}
				<div class="text-center text-gray-500 py-8">No results yet</div>
			{:else}
				<div class="space-y-3">
					{#each leaderboard as entry}
						<div
							class="bg-gray-800 rounded-lg p-4 border border-gray-700 transition-all hover:border-blue-500"
						>
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-3">
									<span class="text-2xl {getRankColor(entry.rank)}">
										{getRankMedal(entry.rank)}
									</span>
									<div>
										<div class="font-bold">
											{entry.playerName || `Player ${entry.playerAccount.slice(0, 8)}...`}
										</div>
										<div class="text-xs text-gray-500 font-mono">
											{entry.playerAccount.slice(0, 16)}...
										</div>
									</div>
								</div>
								<div class="text-right">
									<div
										class="text-lg font-bold"
										class:text-green-400={entry.returnPercent >= 0}
										class:text-red-400={entry.returnPercent < 0}
									>
										{formatPercent(entry.returnPercent)}
									</div>
									<div class="text-xs text-gray-400">Return</div>
								</div>
							</div>

							<div class="grid grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t border-gray-700">
								<div>
									<div class="text-gray-400">Portfolio Value</div>
									<div class="font-semibold">{formatPrice(entry.portfolioValue)}</div>
								</div>
								<div class="text-right">
									<div class="text-gray-400">Prize Won</div>
									<div class="font-semibold text-green-400">{formatPrice(entry.prize)}</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Price Changes -->
		<div>
			<h3 class="text-xl font-bold mb-4 flex items-center gap-2">
				<span>📈</span>
				<span>Price Changes</span>
			</h3>

			{#if priceChanges.length === 0}
				<div class="text-center text-gray-500 py-8">No price data yet</div>
			{:else}
				<div class="space-y-3">
					{#each priceChanges as crypto}
						<div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
							<div class="flex items-center justify-between mb-2">
								<div>
									<div class="font-bold text-lg">{crypto.symbol}</div>
									<div class="text-sm text-gray-400">{crypto.name}</div>
								</div>
								<div
									class="text-xl font-bold"
									class:text-green-400={crypto.changePercent >= 0}
									class:text-red-400={crypto.changePercent < 0}
								>
									{formatPercent(crypto.changePercent)}
								</div>
							</div>

							<div class="grid grid-cols-2 gap-4 text-sm">
								<div>
									<div class="text-gray-400">Start Price</div>
									<div class="font-mono">{formatPrice(crypto.startPrice)}</div>
								</div>
								<div class="text-right">
									<div class="text-gray-400">End Price</div>
									<div class="font-mono">{formatPrice(crypto.endPrice)}</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Footer Info -->
	<div class="bg-gray-800 p-4 border-t border-gray-700">
		<div class="text-sm text-gray-400 text-center">
			{#if gameMode === 'tournament'}
				<p>Position-based scoring: 1st=5pts, 2nd=4pts, 3rd=3pts, 4th=2pts, 5th=1pt</p>
			{:else}
				<p>Quick Match: All cryptos weighted equally</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.game-results {
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}
</style>
