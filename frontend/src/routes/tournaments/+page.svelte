<script lang="ts">
	import { onMount } from 'svelte';
	import { coinDraftsService } from '$lib/coinDraftsService';
	import type { Tournament } from '$lib/coinDraftsService';
	import { Trophy, Plus } from '@lucide/svelte';
	import { showToast } from '$lib/stores/toasts';
	import { wallet } from '$lib/stores/wallet';
	import { CRYPTO_CATEGORIES, getCategoryKeys, getCategoryName } from '$lib/data/cryptoCategories';

	let tournaments: Tournament[] = $state([]);
	let filteredTournaments: Tournament[] = $state([]);
	let loading = $state(true);
	let showCreateModal = $state(false);
	let creating = $state(false);
	
	const walletState = $derived($wallet);
	
	// Chain selection for joining
	let showChainSelectionModal = $state(false);
	let selectedTournamentId = $state('');
	let selectedChainId = $state('');
	let connecting = $state(false);
	
	// Filters
	let statusFilter = $state('all');
	let typeFilter = $state('all');
	let entryFeeFilter = $state('all');
	let categoryFilter = $state('all');
	
	// Create tournament form
	let newTournament = $state({
		name: '',
		entryFeeUsdc: 10,
		maxParticipants: 16,
		tournamentType: 'SINGLE_ELIMINATION',
		category: 'ALL_CATEGORIES'
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
			if (categoryFilter !== 'all' && tournament.category !== categoryFilter) return false;
			if (entryFeeFilter !== 'all') {
				if (entryFeeFilter === 'free' && tournament.entryFeeUsdc > 0) return false;
				if (entryFeeFilter === 'paid' && tournament.entryFeeUsdc === 0) return false;
			}
			return true;
		});
	}

	async function joinTournament(tournamentId: string) {
		// If wallet is connected, join directly
		if (walletState.isConnected && walletState.chainId) {
			try {
				connecting = true;
				const result = await coinDraftsService.registerForTournament(
					tournamentId, 
					walletState.chainId
				);
				
				if (result.success) {
					showToast('Successfully joined tournament!', 'success');
					await loadTournaments();
				} else {
					showToast('Failed to join tournament. Please try again.', 'error');
				}
			} catch (error) {
				console.error('Error joining tournament:', error);
				showToast('Error joining tournament. Please try again.', 'error');
			} finally {
				connecting = false;
			}
		} else {
			// Show chain selection modal if wallet not connected
			showChainSelectionModal = true;
			selectedTournamentId = tournamentId;
			selectedChainId = ''; // Reset
		}
	}

	async function connectToChainAndJoin() {
		if (!selectedChainId) {
			showToast('Please select a chain first', 'error');
			return;
		}

		try {
			connecting = true;
			
		
			const playerChainId = selectedChainId;
			const result = await coinDraftsService.registerForTournament(
				selectedTournamentId, 
				playerChainId
			);
			
			if (result.success) {
				showToast(`Successfully joined tournament using chain ${playerChainId}!`, 'success');
				showChainSelectionModal = false;
				await loadTournaments(); // Refresh the list
			} else {
				showToast('Failed to join tournament. Please try again.', 'error');
			}
		} catch (error) {
			console.error('Error joining tournament:', error);
			showToast('Error joining tournament. Please try again.', 'error');
		} finally {
			connecting = false;
		}
	}

	async function createTournament() {
		// Validate form
		if (!newTournament.name.trim()) {
			showToast('Please enter a tournament name', 'error');
			return;
		}
		
		if (newTournament.entryFeeUsdc < 1) {
			showToast('Entry fee must be at least $1', 'error');
			return;
		}

		try {
			creating = true;
			console.log('Creating tournament with data:', newTournament);
			const result = await coinDraftsService.createTournament(
				newTournament.name,
				newTournament.entryFeeUsdc,
				newTournament.maxParticipants,
				newTournament.tournamentType,
				newTournament.category
			);
			
			console.log('Tournament creation result:', result);
			
			if (result.success) {
				showToast('Tournament created successfully!', 'success');
				showCreateModal = false;
				await loadTournaments();
				// Reset form
				newTournament = {
					name: '',
					entryFeeUsdc: 10,
					maxParticipants: 16,
					tournamentType: 'SINGLE_ELIMINATION',
					category: 'ALL_CATEGORIES'
				};
			} else {
				showToast('Failed to create tournament. Please try again.', 'error');
			}
		} catch (error) {
			console.error('Error creating tournament:', error);
			showToast('Error creating tournament. Check console for details.', 'error');
		} finally {
			creating = false;
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
			<h1 class="text-4xl font-bold text-white mb-2 flex items-center gap-3">
				<Trophy class="w-10 h-10 text-primary-green" />
				Tournaments
			</h1>
			<p class="text-text-secondary">Compete in structured multi-round competitions</p>
		</div>
		<button 
			onclick={() => showCreateModal = true}
			class="bg-primary-green hover:bg-dark-green text-black font-bold py-3 px-6 rounded-full transition-colors cursor-pointer flex items-center gap-2 border-2 border-primary-green"
			style="background-color: #39ff14 !important; color: black !important; display: flex !important; visibility: visible !important;"
		>
			<Plus class="w-5 h-5" />
			Create Tournament
		</button>
	</div>

	<!-- Filters -->
	<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-primary-green/30">
		<h3 class="text-lg font-semibold text-white mb-4">Filters</h3>
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
				<label class="block text-sm font-medium text-text-secondary mb-2">Category</label>
				<select bind:value={categoryFilter} class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white">
					<option value="all">All Categories</option>
					{#each getCategoryKeys() as categoryKey}
						<option value={categoryKey}>{getCategoryName(categoryKey)}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium text-text-secondary mb-2">Type</label>
				<select bind:value={typeFilter} class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white">
					<option value="all">All Types</option>
					<option value="SINGLE_ELIMINATION">Single Elimination</option>
					<option value="DOUBLE_ELIMINATION">Double Elimination</option>
					<option value="ROUND_ROBIN">Round Robin</option>
					<option value="SWISS">Swiss System</option>
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
			<div class="flex justify-center mb-4">
				<Trophy class="w-16 h-16 text-primary-green" />
			</div>
			<h3 class="text-xl font-semibold text-white mb-2">No tournaments found</h3>
			<p class="text-text-secondary mb-6">Be the first to create a tournament!</p>
			<button
				onclick={() => showCreateModal = true}
				class="bg-primary-green hover:bg-dark-green text-black font-bold py-3 px-6 rounded-full cursor-pointer flex items-center gap-2 mx-auto"
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
							tournament.status === 'Active' ? 'bg-primary-green/20 text-primary-green border-primary-green/30 animate-pulse' :
							tournament.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
							'bg-gray-500/20 text-gray-300 border-gray-500/30'
						}">
							{tournament.status === 'Active' ? '🔴 LIVE' : tournament.status}
						</span>
					</div>

					<!-- Category Badge -->
					{#if tournament.category}
						<div class="mb-4">
							<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
								{getCategoryName(tournament.category)}
							</span>
						</div>
					{/if}

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
						<button 
							onclick={() => joinTournament(tournament.id)}
							class="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded-full transition-colors font-medium cursor-pointer"
						>
							Join Tournament
						</button>
						<a 
							href="/tournaments/{tournament.id}"
							class="flex-1 bg-primary-green hover:bg-dark-green text-black text-center py-2 rounded-full transition-colors font-medium cursor-pointer"
						>
							View Details
						</a>
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
							class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60"
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
							<option value="SINGLE_ELIMINATION">Single Elimination</option>
							<option value="DOUBLE_ELIMINATION">Double Elimination</option>
							<option value="ROUND_ROBIN">Round Robin</option>
							<option value="SWISS">Swiss System</option>
						</select>
					</div>
					
					<div>
						<label for="category" class="block text-sm font-medium text-text-secondary mb-2">Crypto Category</label>
						<select id="category" bind:value={newTournament.category} class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white">
							{#each getCategoryKeys() as categoryKey}
								<option value={categoryKey}>{CRYPTO_CATEGORIES[categoryKey].name}</option>
							{/each}
						</select>
						<p class="text-xs text-text-secondary mt-1">
							{CRYPTO_CATEGORIES[newTournament.category].description}
						</p>
					</div>
				</div>
				
				<div class="flex gap-4 mt-8">
					<button 
						type="button"
						onclick={() => showCreateModal = false}
						class="flex-1 border border-white/30 text-white hover:bg-white/10 py-2 rounded-full transition-colors cursor-pointer"
					>
						Cancel
					</button>
					<button 
						type="submit"
						disabled={creating}
						class="flex-1 py-2 rounded-full transition-colors font-bold {
							creating 
								? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
								: 'bg-primary-green hover:bg-dark-green text-black cursor-pointer'
						}"
					>
						{creating ? 'Creating...' : 'Create Tournament'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Chain Selection Modal -->
{#if showChainSelectionModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30 max-w-md w-full">
			<h2 class="text-2xl font-bold text-white mb-6">Select Your Player Chain</h2>
			
			<div class="space-y-4 mb-6">
				<p class="text-text-secondary">
					CoinDrafts uses your personal microchain for complete data sovereignty. Select which chain to use for this tournament.
				</p>
				
				<div>
					<label for="chain-id" class="block text-sm font-medium text-text-secondary mb-2">
						Player Chain ID
					</label>
					<input 
						id="chain-id"
						bind:value={selectedChainId}
						type="text" 
						placeholder="Enter your chain ID (e.g., 1db1936dad0717597a7743a8353c9c0191c2256e7fb9a8ed92f09f6665813578e24)"
						class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/60 text-sm"
					>
				</div>
				
				<div class="bg-primary-green/10 border border-primary-green/30 rounded-lg p-3">
					<p class="text-xs text-primary-green">
						💡 Your chain ID represents your personal blockchain where your game data is stored with complete sovereignty.
					</p>
				</div>
			</div>
			
			<div class="flex gap-4">
				<button 
					type="button"
					onclick={() => showChainSelectionModal = false}
					class="flex-1 border border-white/30 text-white hover:bg-white/10 py-2 rounded-full transition-colors cursor-pointer"
				>
					Cancel
				</button>
				<button 
					onclick={connectToChainAndJoin}
					disabled={connecting || !selectedChainId.trim()}
					class="flex-1 py-2 rounded-full transition-colors font-bold {
						(connecting || !selectedChainId.trim())
							? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
							: 'bg-primary-green hover:bg-dark-green text-black cursor-pointer'
					}"
				>
					{connecting ? 'Connecting...' : 'Join Tournament'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	select option {
		background-color: #1f2937;
		color: white;
	}
</style>