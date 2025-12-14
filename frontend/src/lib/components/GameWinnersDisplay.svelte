<script lang="ts">
	import type { Game } from '$lib/coinDraftsService';
	import { Trophy } from '@lucide/svelte';

	let { game }: { game: Game } = $props();

	const totalPrizePool = $derived(game.entryFeeUsdc * game.playerCount);
	const prizes = $derived([
		{ place: '1st', percentage: 50, amount: Math.floor(totalPrizePool * 0.5), emoji: '🥇', color: 'from-yellow-400 to-yellow-600' },
		{ place: '2nd', percentage: 30, amount: Math.floor(totalPrizePool * 0.3), emoji: '🥈', color: 'from-gray-300 to-gray-500' },
		{ place: '3rd', percentage: 20, amount: Math.floor(totalPrizePool * 0.2), emoji: '🥉', color: 'from-orange-400 to-orange-600' }
	]);

	function formatUsdc(microUsdc: number): string {
		return `$${(microUsdc / 1_000_000).toFixed(2)}`;
	}

	function shortenAddress(address: string): string {
		if (!address) return 'Unknown';
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	}
</script>

<div class="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 mb-8 border border-green-500/20">
	<!-- Header -->
	<div class="text-center mb-6">
		<div class="flex items-center justify-center gap-2 mb-2">
			<Trophy class="text-yellow-400" size={32} />
			<h2 class="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
				Game Complete!
			</h2>
		</div>
		<p class="text-xl text-green-400 font-semibold">
			Total Prize Pool: {formatUsdc(totalPrizePool)}
		</p>
	</div>

	<!-- Podium -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
		{#each prizes as prize, index}
			{@const winner = game.winners[index]}
			<div class="bg-black/30 rounded-lg p-6 border-2 transition-all hover:scale-105 {
				index === 0 ? 'border-yellow-500/50' :
				index === 1 ? 'border-gray-400/50' :
				'border-orange-500/50'
			} {winner ? 'hover:border-green-400/50 cursor-pointer' : 'opacity-60'}">
				
				<!-- Trophy -->
				<div class="text-5xl text-center mb-3">{prize.emoji}</div>
				
				<!-- Place -->
				<div class="text-center text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
					{prize.place} Place
				</div>
				
				{#if winner}
					<!-- Winner Info -->
					<div class="space-y-3">
						<div class="bg-black/50 rounded-lg p-2 text-center">
							<div class="font-mono text-xs text-gray-400 mb-1">Winner</div>
							<div class="font-mono text-sm text-white" title={winner}>
								{shortenAddress(winner)}
							</div>
						</div>
						
						<div class="text-center">
							<div class="text-2xl font-bold text-green-400">
								{formatUsdc(prize.amount)}
							</div>
							<div class="text-sm text-gray-400">
								{prize.percentage}% of pool
							</div>
						</div>
					</div>
				{:else}
					<!-- No Winner -->
					<div class="text-center space-y-2">
						<div class="text-sm text-gray-500">No winner</div>
						<div class="text-lg text-gray-600">{formatUsdc(prize.amount)}</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Congratulations Message -->
	{#if game.winners && game.winners.length > 0}
		<div class="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
			<p class="text-green-400 font-medium">
				🎉 Congratulations to all winners! Prizes have been distributed.
			</p>
		</div>
	{:else}
		<div class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
			<p class="text-yellow-400 font-medium">
				⚠️ No winners determined yet. Game may need more players.
			</p>
		</div>
	{/if}
</div>
