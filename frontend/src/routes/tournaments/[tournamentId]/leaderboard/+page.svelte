<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import coinDraftsService from '$lib/coinDraftsService';
	import type { LeaderboardEntry } from '$lib/coinDraftsService';

	const tournamentId = $page.params.tournamentId;
	
	let leaderboard: LeaderboardEntry[] = [];
	let loading = true;
	let error = '';

	// Format Ethereum address to shortened version
	function shortenAddress(address: string): string {
		if (address.length < 10) return address;
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	}

	// Format total return from scaled integer to percentage
	function formatReturn(scaledReturn: number): string {
		const percentage = scaledReturn / 10000;
		return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
	}

	// Format winning amount from micro-units to USDC
	function formatPrize(microUsdc: number): string {
		const usdc = microUsdc / 1000000;
		return usdc > 0 ? `$${usdc.toFixed(2)}` : '-';
	}

	// Get rank styling
	function getRankClass(rank: number): string {
		if (rank === 1) return 'rank-1';
		if (rank === 2) return 'rank-2';
		if (rank === 3) return 'rank-3';
		return '';
	}

	async function loadLeaderboard() {
		try {
			loading = true;
			error = '';
			leaderboard = await coinDraftsService.fetchLeaderboard(tournamentId);
			
			if (leaderboard.length === 0) {
				error = 'No leaderboard data available yet';
			}
		} catch (err) {
			console.error('Failed to load leaderboard:', err);
			error = 'Failed to load leaderboard';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadLeaderboard();
	});
</script>

<div class="leaderboard-container">
	<div class="header">
		<h1>Tournament Leaderboard</h1>
		<a href="/tournaments/{tournamentId}" class="back-link">← Back to Tournament</a>
	</div>

	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Loading leaderboard...</p>
		</div>
	{:else if error}
		<div class="error">
			<p>{error}</p>
			<button on:click={loadLeaderboard}>Retry</button>
		</div>
	{:else if leaderboard.length > 0}
		<div class="leaderboard-table">
			<table>
				<thead>
					<tr>
						<th>Rank</th>
						<th>Player</th>
						<th>Return</th>
						<th>Prize</th>
					</tr>
				</thead>
				<tbody>
					{#each leaderboard as entry}
						<tr class={getRankClass(entry.rank)}>
							<td class="rank-cell">
								{#if entry.rank === 1}
									🥇
								{:else if entry.rank === 2}
									🥈
								{:else if entry.rank === 3}
									🥉
								{:else}
									{entry.rank}
								{/if}
							</td>
							<td class="player-cell">
								<code>{shortenAddress(entry.playerAccount)}</code>
							</td>
							<td class="return-cell" class:positive={entry.totalReturn >= 0} class:negative={entry.totalReturn < 0}>
								{formatReturn(entry.totalReturn)}
							</td>
							<td class="prize-cell">
								{formatPrize(entry.winningAmount)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.leaderboard-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 2rem;
		font-weight: 700;
		color: #fff;
		margin: 0;
	}

	.back-link {
		color: #60a5fa;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: #93c5fd;
	}

	.loading {
		text-align: center;
		padding: 3rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		margin: 0 auto 1rem;
		border: 4px solid rgba(255, 255, 255, 0.1);
		border-top-color: #60a5fa;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading p {
		color: rgba(255, 255, 255, 0.7);
	}

	.error {
		text-align: center;
		padding: 2rem;
		background: rgba(239, 68, 68, 0.1);
		border-radius: 8px;
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.error p {
		color: #fca5a5;
		margin-bottom: 1rem;
	}

	.error button {
		padding: 0.5rem 1rem;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	.error button:hover {
		background: #dc2626;
	}

	.leaderboard-table {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background: rgba(255, 255, 255, 0.05);
	}

	th {
		padding: 1rem;
		text-align: left;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	tbody tr {
		transition: background-color 0.2s;
	}

	tbody tr:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	td {
		padding: 1rem;
		color: rgba(255, 255, 255, 0.8);
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	.rank-cell {
		font-size: 1.25rem;
		font-weight: 600;
		text-align: center;
		width: 80px;
	}

	.player-cell code {
		font-family: 'Monaco', 'Courier New', monospace;
		background: rgba(255, 255, 255, 0.05);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.return-cell {
		font-weight: 600;
		text-align: right;
	}

	.return-cell.positive {
		color: #4ade80;
	}

	.return-cell.negative {
		color: #f87171;
	}

	.prize-cell {
		font-weight: 600;
		text-align: right;
		color: #fbbf24;
	}

	/* Special styling for top 3 ranks */
	.rank-1 {
		background: linear-gradient(90deg, rgba(251, 191, 36, 0.1) 0%, transparent 100%);
	}

	.rank-2 {
		background: linear-gradient(90deg, rgba(192, 192, 192, 0.1) 0%, transparent 100%);
	}

	.rank-3 {
		background: linear-gradient(90deg, rgba(205, 127, 50, 0.1) 0%, transparent 100%);
	}

	@media (max-width: 640px) {
		.leaderboard-container {
			padding: 1rem;
		}

		.header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		th, td {
			padding: 0.75rem 0.5rem;
		}

		.player-cell code {
			font-size: 0.75rem;
		}
	}
</style>
