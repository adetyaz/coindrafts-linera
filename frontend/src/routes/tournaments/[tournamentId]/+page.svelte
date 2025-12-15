<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { coinDraftsService, type PriceSnapshotInput } from '$lib/coinDraftsService';
	import type { Tournament } from '$lib/coinDraftsService';
	import { Trophy, Users, DollarSign, Calendar, Crown, ArrowLeft, TrendingUp, Play, StopCircle } from '@lucide/svelte';
	import { showToast } from '$lib/stores/toasts';
	import { getPriceSnapshot } from '$lib/services/priceService';
	import TournamentChart from '$lib/components/TournamentChart.svelte';

	const tournamentId = page.params.tournamentId;
	
	let tournament = $state<Tournament | null>(null);
	let participants = $state<string[]>([]);
	let results = $state<string[]>([]);
	let leaderboard = $state<any[]>([]);
	let portfolios = $state<Map<string, any>>(new Map());
	let loading = $state(true);
	let error = $state('');
	let startingTournament = $state(false);
	let endingTournament = $state(false);
	let cryptoIds = $state<string[]>([]);

	onMount(async () => {
		await loadTournamentDetails();
	});

	async function loadTournamentDetails() {
		try {
			const isInitialLoad = loading;
			if (isInitialLoad) {
				loading = true;
			}
			error = '';
			
			if (!tournamentId) {
				error = 'Invalid tournament ID';
				return;
			}
			
			// Load tournament details
			tournament = await coinDraftsService.fetchTournament(tournamentId);
			
			if (!tournament) {
				error = 'Tournament not found';
				return;
			}

			// Load participants and results
			participants = await coinDraftsService.fetchTournamentParticipants(tournamentId);
			results = await coinDraftsService.fetchTournamentResults(tournamentId);
			
			// Load leaderboard for completed tournaments
			if (tournament.status.toUpperCase() === 'COMPLETED') {
				try {
					leaderboard = await coinDraftsService.fetchTournamentLeaderboard(tournamentId);
				} catch (err) {
					console.error('Failed to load leaderboard:', err);
				}
			}
			
			// Load portfolios for all participants
			if (participants.length > 0) {
				const newPortfolios = new Map();
				for (const participant of participants) {
					try {
						const portfolio = await coinDraftsService.fetchPlayerPortfolio(
							tournamentId,
							participant
						);
						if (portfolio) {
							newPortfolios.set(participant, portfolio);
						}
					} catch (err) {
						console.error(`Failed to load portfolio for ${participant}:`, err);
					}
				}
				portfolios = newPortfolios;
				
				// Log unique selected cryptocurrencies
				const allSelectedCryptos = Array.from(portfolios.values())
					.flatMap(p => p.cryptoPicks)
					.filter((v, i, a) => a.indexOf(v) === i)
					.sort();


				cryptoIds = allSelectedCryptos;
			
			}
			
		} catch (err) {
			console.error('Failed to load tournament details:', err);
			error = 'Failed to load tournament details';
		} finally {
			loading = false;
		}
	}

	async function joinTournament() {
		// Redirect to draft page - registration happens when portfolio is submitted
		if (!tournamentId) {
			showToast('Invalid tournament ID', 'error');
			return;
		}
		goto(`/tournaments/${tournamentId}/draft`);
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'Registration': return 'text-green-400';
			case 'InProgress': return 'text-yellow-400';
			case 'Completed': return 'text-blue-400';
			default: return 'text-gray-400';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'Registration': return Users;
			case 'InProgress': return Trophy;
			case 'Completed': return Crown;
			default: return Calendar;
		}
	}

	async function handleStartTournament() {
		if (!tournamentId) {
			showToast('Invalid tournament ID', 'error');
			return;
		}

		try {
			startingTournament = true;
			
			// Get real-time prices for all cryptos
			const snapshot = await getPriceSnapshot(cryptoIds);
			
			// Convert to backend format (micro-USDC)
			const priceSnapshot: PriceSnapshotInput[] = Object.entries(snapshot.prices).map(([cryptoId, priceUsd]) => ({
				cryptoId,
				priceUsd: Math.floor(priceUsd * 1_000_000), // Convert to micro-USDC
				timestamp: snapshot.timestamp
			}));

			const result = await coinDraftsService.startTournament(tournamentId, priceSnapshot);

			if (result.success) {
				showToast('Tournament started successfully!', 'success');
				setTimeout(() => window.location.reload(), 1000);
			} else {
				showToast('Failed to start tournament', 'error');
			}
		} catch (error) {
			console.error('Error starting tournament:', error);
			showToast('Error starting tournament. Please try again.', 'error');
		} finally {
			startingTournament = false;
		}
	}

	async function handleEndTournament() {
		if (!tournamentId) {
			showToast('Invalid tournament ID', 'error');
			return;
		}

		try {
			endingTournament = true;
			
			// Get real-time prices for all cryptos

			
			const snapshot = await getPriceSnapshot(cryptoIds);
			
			// Convert to backend format (micro-USDC)
			const priceSnapshot: PriceSnapshotInput[] = Object.entries(snapshot.prices).map(([cryptoId, priceUsd]) => ({
				cryptoId,
				priceUsd: Math.floor(priceUsd * 1_000_000), // Convert to micro-USDC
				timestamp: snapshot.timestamp
			}));

			const result = await coinDraftsService.endTournament(tournamentId, priceSnapshot);

			if (result.success) {
				showToast('Tournament ended successfully!', 'success');
				setTimeout(() => window.location.reload(), 1000);
			} else {
				showToast('Failed to end tournament', 'error');
			}
		} catch (error) {
			console.error('Error ending tournament:', error);
			showToast('Error ending tournament. Please try again.', 'error');
		} finally {
			endingTournament = false;
		}
	}
</script>

<div class="min-h-screen bg-black text-green-400 p-6">
	<div class="max-w-4xl mx-auto">
		<!-- Header with Back Button -->
		<div class="flex items-center gap-4 mb-8">
			<a href="/tournaments" class="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors">
				<ArrowLeft size={20} />
				Back to Tournaments
			</a>
		</div>

		{#if loading}
			<div class="flex justify-center items-center py-20">
				<div class="text-green-400 text-xl">Loading tournament details...</div>
			</div>
		{:else if error}
			<div class="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
				<div class="text-red-400 text-xl mb-4">{error}</div>
				<button 
					onclick={loadTournamentDetails}
					class="bg-green-600 hover:bg-green-700 text-black px-6 py-2 rounded-full font-semibold transition-colors cursor-pointer"
				>
					Retry
				</button>
			</div>
		{:else if tournament}
			<!-- Tournament Header -->
			<div class="bg-gray-900 rounded-lg p-6 mb-8 border border-green-500/20">
				<div class="flex items-start justify-between mb-4">
					<div>
						<h1 class="text-3xl font-bold text-green-400 mb-2">{tournament.name}</h1>
						<div class="flex items-center gap-2 text-lg">
							{#if tournament.status === 'Registration'}
								<Users size={20} />
							{:else if tournament.status === 'InProgress'}
								<Trophy size={20} />
							{:else if tournament.status === 'Completed'}
								<Crown size={20} />
							{:else}
								<Calendar size={20} />
							{/if}
							<span class={getStatusColor(tournament.status)}>{tournament.status}</span>
						</div>
					</div>
					
					<div class="flex gap-3">
						{#if tournament.status.toLowerCase().includes('registration') || tournament.status === 'PENDING'}
							<button 
								onclick={joinTournament}
								class="bg-[#39ff14] hover:bg-[#0bd10b] text-black px-6 py-3 rounded-full font-semibold transition-colors cursor-pointer flex items-center gap-2"
							>
								<Users size={20} />
								Join Tournament
							</button>
							<button 
								onclick={handleStartTournament}
							disabled={startingTournament || participants.length < 2}
							class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold transition-colors cursor-pointer flex items-center gap-2"
							title={participants.length < 2 ? 'Need at least 2 players to start' : ''}
							>
								<Play size={20} />
								{startingTournament ? 'Starting...' : 'Start Tournament'}
							</button>
						{:else if tournament.status.toLowerCase().includes('progress') || tournament.status.toLowerCase() === 'active'}
							<button 
								onclick={handleEndTournament}
								disabled={endingTournament}
								class="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold transition-colors cursor-pointer flex items-center gap-2"
							>
								<StopCircle size={20} />
								{endingTournament ? 'Ending...' : 'End Tournament'}
							</button>
						{:else if tournament.status.toLowerCase().includes('completed')}
							<div class="text-green-400 font-semibold text-lg">Tournament Completed</div>
						{/if}
					</div>
				</div>

				<!-- Tournament Details Grid -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="flex items-center gap-3 bg-black/30 rounded-lg p-4">
						<DollarSign size={24} class="text-green-400" />
						<div>
							<div class="text-sm text-gray-400">Entry Fee</div>
							<div class="text-lg font-semibold">${tournament.entryFeeUsdc} USDC</div>
						</div>
					</div>

					<div class="flex items-center gap-3 bg-black/30 rounded-lg p-4">
						<Users size={24} class="text-green-400" />
						<div>
							<div class="text-sm text-gray-400">Participants</div>
							<div class="text-lg font-semibold">{participants.length} / {tournament.maxParticipants}</div>
						</div>
					</div>

					<div class="flex items-center gap-3 bg-black/30 rounded-lg p-4">
						<Calendar size={24} class="text-green-400" />
						<div>
							<div class="text-sm text-gray-400">Duration</div>
							<div class="text-lg font-semibold">7 Days</div>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				{#if tournament.status === 'InProgress' || tournament.status === 'Completed'}
					<div class="mt-6 flex gap-4">
						<a 
							href="/tournaments/{tournamentId}/leaderboard"
							class="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 no-underline"
						>
							<TrendingUp size={20} />
							View Leaderboard
						</a>
						{#if tournament.status === 'InProgress'}
							<a 
								href="/tournaments/{tournamentId}/draft"
								class="flex-1 bg-green-600 hover:bg-green-700 text-black px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 no-underline"
							>
								<Trophy size={20} />
								Draft Portfolio
							</a>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Chart Section (if tournament is in progress) -->
		<!-- DEBUG: Status = {tournament.status} -->
		{#if tournament.status.toLowerCase().includes('progress') || tournament.status.toLowerCase() === 'active'}
			{@const allCryptoIds = Array.from(portfolios.values()).flatMap(p => p.cryptoPicks).filter((v, i, a) => a.indexOf(v) === i)}
			<div class="bg-gray-900 rounded-lg p-6 mb-8 border border-green-500/20">
				<h2 class="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
					<TrendingUp size={24} />
					Live Competition (Status: {tournament.status})
				</h2>
				{#if allCryptoIds.length > 0}
					<TournamentChart cryptoIds={allCryptoIds} />
				{:else}
					<div class="text-center py-8">
						<p class="text-gray-400 mb-2">Waiting for participants to submit portfolios...</p>
						<p class="text-sm text-gray-500">
							Participants: {participants.length} | Portfolios loaded: {portfolios.size}
						</p>
						<p class="text-xs text-gray-600 mt-2">
							Debug: {JSON.stringify(Array.from(portfolios.values()))}
						</p>
					</div>
				{/if}
			</div>
		{/if}

			<!-- Results Section (if tournament is completed) -->
			{#if tournament.status.toUpperCase() === 'COMPLETED' && leaderboard.length > 0}
				<div class="bg-gray-900 rounded-lg p-6 mb-8 border border-green-500/20">
					<h2 class="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
						<Crown size={24} />
						Results
					</h2>
					
					<div class="space-y-3">
						{#each leaderboard.slice(0, 3) as entry, index}
							<div class="bg-black/30 rounded-lg p-4 flex items-center gap-4">
								<div class="flex items-center justify-center w-12 h-12 rounded-full
									{index === 0 ? 'bg-yellow-500 text-black' : 
									 index === 1 ? 'bg-gray-400 text-black' : 
									 index === 2 ? 'bg-amber-600 text-black' : 'bg-green-600 text-black'}
									font-bold text-lg">
									{entry.rank}
								</div>
								<div class="flex-1">
									<div class="font-semibold truncate">{entry.playerAccount}</div>
									<div class="text-sm text-gray-400">
										Portfolio Return: <span class="font-bold text-green-400">{(entry.totalReturn / 10000).toFixed(2)}%</span>
									</div>
									{#if index === 0}
										<div class="text-yellow-400 text-sm font-semibold">🏆 Winner {entry.winningAmount > 0 ? `- $${(entry.winningAmount / 1000000).toFixed(2)} USDC` : ''}</div>
									{:else if index === 1}
										<div class="text-gray-300 text-sm font-semibold">🥈 Runner-up {entry.winningAmount > 0 ? `- $${(entry.winningAmount / 1000000).toFixed(2)} USDC` : ''}</div>
									{:else if index === 2}
										<div class="text-amber-500 text-sm font-semibold">🥉 Third Place {entry.winningAmount > 0 ? `- $${(entry.winningAmount / 1000000).toFixed(2)} USDC` : ''}</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Participants Section -->
			<div class="bg-gray-900 rounded-lg p-6 mb-8 border border-green-500/20">
				<h2 class="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
					<Users size={24} />
					Participants ({participants.length})
				</h2>
				
				{#if participants.length > 0}
					<div class="space-y-4">
						{#each participants as participant, index}
							<div class="bg-black/30 rounded-lg p-4">
								<div class="flex items-center gap-3 mb-3">
									<div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-black font-bold">
										{index + 1}
									</div>
									<div class="truncate font-semibold">{participant}</div>
								</div>
								{#if portfolios.has(participant)}
									{@const portfolio = portfolios.get(participant)}
									<div class="ml-11 text-sm">
										<div class="text-gray-400 mb-1">Portfolio:</div>
										<div class="flex flex-wrap gap-2">
											{#each portfolio.cryptoPicks as crypto}
												<span class="bg-green-600/20 text-green-400 px-2 py-1 rounded">{crypto}</span>
											{/each}
										</div>
										{#if portfolio.strategyNotes}
											<div class="mt-2 text-gray-400 italic text-xs">{portfolio.strategyNotes}</div>
										{/if}
									</div>
								{:else}
									<div class="ml-11 text-sm text-gray-500">No portfolio submitted</div>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8 text-gray-400">
						No participants yet. Be the first to join!
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>