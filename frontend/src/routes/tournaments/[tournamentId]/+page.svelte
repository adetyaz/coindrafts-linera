<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { coinDraftsService, type Tournament } from '$lib/coinDraftsService';
	import { Trophy, Users, DollarSign, Calendar, Crown, ArrowLeft } from '@lucide/svelte';

	const tournamentId = page.params.tournamentId;
	
	let tournament = $state<Tournament | null>(null);
	let participants = $state<string[]>([]);
	let results = $state<string[]>([]);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		await loadTournamentDetails();
	});

	async function loadTournamentDetails() {
		try {
			loading = true;
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
			
		} catch (err) {
			console.error('Failed to load tournament details:', err);
			error = 'Failed to load tournament details';
		} finally {
			loading = false;
		}
	}

	async function joinTournament() {
		try {
			if (!tournamentId) {
				error = 'Invalid tournament ID';
				return;
			}
			const result = await coinDraftsService.registerForTournament(tournamentId, 'current-user');
			if (result.success) {
				await loadTournamentDetails(); // Refresh data
			} else {
				error = 'Failed to join tournament';
			}
		} catch (err) {
			console.error('Failed to join tournament:', err);
			error = 'Failed to join tournament';
		}
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
					
					{#if tournament.status === 'Registration'}
						<button 
							onclick={joinTournament}
							class="bg-green-600 hover:bg-green-700 text-black px-6 py-3 rounded-full font-semibold transition-colors cursor-pointer flex items-center gap-2"
						>
							<Users size={20} />
							Join Tournament
						</button>
					{/if}
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
						<Trophy size={24} class="text-green-400" />
						<div>
							<div class="text-sm text-gray-400">Format</div>
							<div class="text-lg font-semibold">{tournament.tournamentType.replace('_', ' ')}</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Participants Section -->
			<div class="bg-gray-900 rounded-lg p-6 mb-8 border border-green-500/20">
				<h2 class="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
					<Users size={24} />
					Participants ({participants.length})
				</h2>
				
				{#if participants.length > 0}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{#each participants as participant, index}
							<div class="bg-black/30 rounded-lg p-3 flex items-center gap-3">
								<div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-black font-bold">
									{index + 1}
								</div>
								<div class="truncate">{participant}</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8 text-gray-400">
						No participants yet. Be the first to join!
					</div>
				{/if}
			</div>

			<!-- Results Section (if tournament is completed) -->
			{#if tournament.status === 'Completed' && results.length > 0}
				<div class="bg-gray-900 rounded-lg p-6 border border-green-500/20">
					<h2 class="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
						<Crown size={24} />
						Results
					</h2>
					
					<div class="space-y-3">
						{#each results as result, index}
							<div class="bg-black/30 rounded-lg p-4 flex items-center gap-4">
								<div class="flex items-center justify-center w-12 h-12 rounded-full
									{index === 0 ? 'bg-yellow-500 text-black' : 
									 index === 1 ? 'bg-gray-400 text-black' : 
									 index === 2 ? 'bg-amber-600 text-black' : 'bg-green-600 text-black'}
									font-bold text-lg">
									{index + 1}
								</div>
								<div class="flex-1">
									<div class="font-semibold">{result}</div>
									{#if index === 0}
										<div class="text-yellow-400 text-sm">🏆 Winner</div>
									{:else if index === 1}
										<div class="text-gray-400 text-sm">🥈 Runner-up</div>
									{:else if index === 2}
										<div class="text-amber-600 text-sm">🥉 Third Place</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>