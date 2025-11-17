<script lang="ts">
	import { onMount } from 'svelte';
	import { coinDraftsService } from '$lib/coinDraftsService';
	import type { Tournament } from '$lib/coinDraftsService';

	let tournaments: Tournament[] = $state([]);
	let filteredTournaments: Tournament[] = $state([]);
	let loading = $state(true);
	let showCreateModal = $state(false);
	
	// Filters
	let statusFilter = $state('all');
	let typeFilter = $state('all');
	let entryFeeFilter = $state('all');
	
	// Create tournament form
	let newTournament = $state({
		name: '',
		entryFeeUsdc: 10,
		maxParticipants: 16,
		tournamentType: 'SingleElimination'
	});

	onMount(async () => {
		await loadTournaments();
	});

	async function loadTournaments() {
		try {
			loading = true;
			tournaments = await coinDraftsService.fetchTournaments();
			applyFilters();
		} catch (error) {
			console.error('Error loading tournaments:', error);
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		filteredTournaments = tournaments.filter(tournament => {
			if (statusFilter !== 'all' && tournament.status !== statusFilter) return false;
			if (typeFilter !== 'all' && tournament.tournamentType !== typeFilter) return false;
			if (entryFeeFilter !== 'all') {
				if (entryFeeFilter === 'free' && tournament.entryFeeUsdc > 0) return false;
				if (entryFeeFilter === 'paid' && tournament.entryFeeUsdc === 0) return false;
			}
			return true;
		});
	}

	async function createTournament() {
		try {
			const result = await coinDraftsService.createTournament(
				newTournament.name,
				newTournament.entryFeeUsdc,
				newTournament.maxParticipants,
				newTournament.tournamentType
			);
			
			if (result.success) {
				showCreateModal = false;
				await loadTournaments();
				// Reset form
				newTournament = {
					name: '',
					entryFeeUsdc: 10,
					maxParticipants: 16,
					tournamentType: 'SingleElimination'
				};
			}
		} catch (error) {
			console.error('Error creating tournament:', error);
		}
	}

	// Watch filters
	$effect(() => {
		applyFilters();
	});
</script>

<svelte:head>
	<title>Tournaments - CoinDrafts</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="flex flex-col md:flex-row justify-between items-center mb-8">
		<div>
			<h1 class="text-4xl font-bold text-white mb-2">🏆 Tournaments</h1>
			<p class="text-text-secondary">Compete in structured multi-round competitions</p>
		</div>
		<button 
			onclick={() => showCreateModal = true}
			class="bg-primary-green hover:bg-dark-green text-black font-bold py-3 px-6 rounded-lg transition-colors"
		>
			➕ Create Tournament
		</button>
	</div>

	<!-- Filters -->
	<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-primary-green/30">
		<h3 class="text-lg font-semibold text-white mb-4">Filters</h3>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div>
				<label class="block text-sm font-medium text-text-secondary mb-2">Status</label>
				<select bind:value={statusFilter} class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white">
					<option value="all">All Status</option>
					<option value="Pending">Pending</option>
					<option value="Active">Active</option>
					<option value="Completed">Completed</option>
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium text-text-secondary mb-2">Type</label>
				<select bind:value={typeFilter} class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white">
					<option value="all">All Types</option>
					<option value="SingleElimination">Single Elimination</option>
					<option value="DoubleElimination">Double Elimination</option>
					<option value="RoundRobin">Round Robin</option>
					<option value="Swiss">Swiss</option>
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium text-text-secondary mb-2">Entry Fee</label>
				<select bind:value={entryFeeFilter} class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white">
					<option value="all">All Fees</option>
					<option value="free">Free</option>
					<option value="paid">Paid</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Tournament Grid -->
	{#if loading}
		<div class="text-center py-12">
			<div class="text-text-secondary text-lg">Loading tournaments...</div>
		</div>
	{:else if filteredTournaments.length === 0}
		<div class="text-center py-12">
			<div class="text-4xl mb-4">🏆</div>
			<h3 class="text-xl font-semibold text-white mb-2">No tournaments found</h3>
			<p class="text-text-secondary mb-6">Be the first to create a tournament!</p>
			<button 
				onclick={() => showCreateModal = true}
				class="bg-primary-green hover:bg-dark-green text-black font-bold py-3 px-6 rounded-lg"
			>
				Create Tournament
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each filteredTournaments as tournament}
				<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30 hover:border-primary-green/50 transition-all duration-200 hover:transform hover:scale-105">
					<!-- Tournament Header -->
					<div class="flex justify-between items-start mb-4">
						<h3 class="text-lg font-semibold text-white pr-4">{tournament.name}</h3>
						<span class="text-xs px-2 py-1 rounded-full border {
							tournament.status === 'Active' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
							tournament.status === 'Pending' ? 'bg-primary-green/10 text-text-secondary border-border-color' :
							'bg-gray-500/20 text-gray-300 border-gray-500/30'
						}">
							{tournament.status}
						</span>
					</div>

					<!-- Tournament Info -->
					<div class="space-y-3 mb-6">
						<div class="flex justify-between text-sm">
							<span class="text-text-secondary">Type:</span>
							<span class="text-white font-medium">{tournament.tournamentType}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-text-secondary">Entry Fee:</span>
							<span class="text-white font-medium">
								{tournament.entryFeeUsdc === 0 ? 'Free' : `$${tournament.entryFeeUsdc}`}
							</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-text-secondary">Players:</span>
							<span class="text-white font-medium">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-text-secondary">Round:</span>
							<span class="text-white font-medium">{tournament.currentRound}/{tournament.maxRounds}</span>
						</div>
					</div>

					<!-- Progress Bar -->
					<div class="mb-6">
						<div class="flex justify-between text-xs text-text-secondary mb-1">
							<span>Participants</span>
							<span>{Math.round((tournament.currentParticipants / tournament.maxParticipants) * 100)}%</span>
						</div>
						<div class="w-full bg-white/20 rounded-full h-2">
							<div 
								class="h-2 rounded-full transition-all duration-300"
								style="background: linear-gradient(to right, #8b5cf6, #3b82f6); width: {(tournament.currentParticipants / tournament.maxParticipants) * 100}%"
							></div>
						</div>
					</div>

					<!-- Actions -->
					<div class="flex gap-2">
						<a 
							href="/tournaments/{tournament.id}"
							class="flex-1 bg-primary-green hover:bg-dark-green text-black text-center py-2 rounded-lg transition-colors font-medium"
						>
							View Details
						</a>
						{#if tournament.status === 'Pending' && tournament.currentParticipants < tournament.maxParticipants}
							<a 
								href="/tournaments/{tournament.id}/join"
								class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
							>
								Join
							</a>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Create Tournament Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30 max-w-md w-full">
			<h2 class="text-2xl font-bold text-white mb-6">Create New Tournament</h2>
			
			<form onsubmit={(e) => { e.preventDefault(); createTournament(); }}>
				<div class="space-y-4">
					<div>
						<label for="tournament-name" class="block text-sm font-medium text-text-secondary mb-2">Tournament Name</label>
						<input 
							id="tournament-name"
							bind:value={newTournament.name}
							type="text" 
							required
							class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-blue-300"
							placeholder="Enter tournament name"
						>
					</div>
					
					<div>
						<label for="entry-fee" class="block text-sm font-medium text-text-secondary mb-2">Entry Fee (USDC)</label>
						<input 
							id="entry-fee"
							bind:value={newTournament.entryFeeUsdc}
							type="number" 
							min="0"
							step="1"
							required
							class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white"
						>
					</div>
					
					<div>
						<label for="max-participants" class="block text-sm font-medium text-text-secondary mb-2">Max Participants</label>
						<select id="max-participants" bind:value={newTournament.maxParticipants} class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white">
							<option value={8}>8 Players</option>
							<option value={16}>16 Players</option>
							<option value={32}>32 Players</option>
							<option value={64}>64 Players</option>
						</select>
					</div>
					
					<div>
						<label for="tournament-type" class="block text-sm font-medium text-text-secondary mb-2">Tournament Type</label>
						<select id="tournament-type" bind:value={newTournament.tournamentType} class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white">
							<option value="SingleElimination">Single Elimination</option>
							<option value="DoubleElimination">Double Elimination</option>
							<option value="RoundRobin">Round Robin</option>
							<option value="Swiss">Swiss</option>
						</select>
					</div>
				</div>
				
				<div class="flex gap-4 mt-8">
					<button 
						type="button"
						onclick={() => showCreateModal = false}
						class="flex-1 border border-white/30 text-white hover:bg-white/10 py-2 rounded-lg transition-colors"
					>
						Cancel
					</button>
					<button 
						type="submit"
						class="flex-1 bg-primary-green hover:bg-dark-green text-black py-2 rounded-lg transition-colors font-bold"
					>
						Create Tournament
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	select option {
		background-color: #1f2937;
		color: white;
	}
</style>