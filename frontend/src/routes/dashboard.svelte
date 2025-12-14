<script lang="ts">
	import { coinDraftsService, type Game, type Tournament } from '$lib/coinDraftsService';
	
	let games = $state<Game[]>([]);
	let tournaments = $state<Tournament[]>([]);
	let loading = $state(true);
	let error = $state('');

	let showCreateGame = $state(false);
	let showCreateTournament = $state(false);
	let gameMode = $state('QUICK_MATCH');
	let tournamentName = $state('');
	let entryFee = $state(10);
	let maxParticipants = $state(16);
	let tournamentType = $state('SINGLE_ELIMINATION');

	$effect(() => {
		async function loadData() {
			try {
				const [gamesData, tournamentsData] = await Promise.all([
					coinDraftsService.fetchGames(),
					coinDraftsService.fetchTournaments()
				]);
				games = gamesData;
				tournaments = tournamentsData;
			} catch (err) {
				error = `Error loading data: ${err}`;
			} finally {
				loading = false;
			}
		}
		
		loadData();
	});

	async function createGame() {
		try {
			await coinDraftsService.createGame(gameMode);
			showCreateGame = false;
			// Refresh games list
			games = await coinDraftsService.fetchGames();
		} catch (err) {
			error = `Error creating game: ${err}`;
		}
	}

	async function createTournament() {
		try {
			await coinDraftsService.createTournament(tournamentName, entryFee, maxParticipants, tournamentType);
			showCreateTournament = false;
			// Reset form
			tournamentName = '';
			entryFee = 10;
			maxParticipants = 16;
			tournamentType = 'SINGLE_ELIMINATION';
			// Refresh tournaments list
			tournaments = await coinDraftsService.fetchTournaments();
		} catch (err) {
			error = `Error creating tournament: ${err}`;
		}
	}

	async function joinGame(gameId: string) {
		try {
			// For now, use a simple player name. In a real app, this would come from wallet/auth
			const playerName = `Player_${Date.now()}`;
			await coinDraftsService.registerPlayer(gameId, playerName);
			// Refresh games list to show updated player count
			games = await coinDraftsService.fetchGames();
		} catch (err) {
			error = `Error joining game: ${err}`;
		}
	}

	async function joinTournament(tournamentId: string) {
		try {
			// For now, use a placeholder account. In a real app, this would come from wallet
			const playerAccount = `player_${Date.now()}`;
			await coinDraftsService.registerForTournament(tournamentId, playerAccount);
			// Refresh tournaments list to show updated participant count
			tournaments = await coinDraftsService.fetchTournaments();
		} catch (err) {
			error = `Error joining tournament: ${err}`;
		}
	}

	function formatTimestamp(timestamp: number): string {
		return new Date(timestamp).toLocaleString();
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'active':
			case 'waiting_for_players':
				return 'text-primary-green';
			case 'in_progress':
				return 'text-primary-green';
			case 'completed':
				return 'text-gray-600';
			default:
				return 'text-gray-500';
		}
	}
</script>

<main class="container mx-auto p-6">
	<h1 class="text-4xl font-bold mb-8 text-center">CoinDrafts Dashboard</h1>

	{#if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-8">
			<p class="text-xl">Loading...</p>
		</div>
	{:else}
		<!-- Games Section -->
		<section class="mb-12">
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-2xl font-semibold">Active Games</h2>
				<button 
					onclick={() => showCreateGame = true}
					class="bg-primary-green hover:bg-dark-green text-black font-bold py-2 px-4 rounded-full cursor-pointer"
				>
					Create Game
				</button>
			</div>

			{#if games.length === 0}
				<p class="text-gray-500 text-center py-8">No active games</p>
			{:else}
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each games as game}
						<div class="bg-white shadow-md rounded-lg p-6 border">
							<h3 class="text-lg font-semibold mb-2">Game {game.gameId}</h3>
							<p class="text-sm text-gray-600 mb-2">Mode: {game.mode}</p>
							<p class="text-sm mb-2">
								Status: <span class={getStatusColor(game.status)}>{game.status}</span>
							</p>
							<p class="text-sm text-gray-600 mb-2">
								Players: {game.playerCount}/{game.maxPlayers}
							</p>
							<p class="text-sm text-gray-600 mb-4">
								Created: {formatTimestamp(game.createdAt)}
							</p>
							{#if game.status === 'waiting_for_players' && game.playerCount < game.maxPlayers}
								<button 
									onclick={() => joinGame(game.gameId)}
									class="bg-primary-green hover:bg-dark-green text-black font-bold py-2 px-4 rounded-full w-full cursor-pointer"
								>
									Join Game
								</button>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Tournaments Section -->
		<section>
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-2xl font-semibold">Tournaments</h2>
				<button 
					onclick={() => showCreateTournament = true}
					class="bg-primary-green hover:bg-dark-green text-black font-bold py-2 px-4 rounded"
				>
					Create Tournament
				</button>
			</div>

			{#if tournaments.length === 0}
				<p class="text-gray-500 text-center py-8">No active tournaments</p>
			{:else}
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each tournaments as tournament}
						<div class="bg-white shadow-md rounded-lg p-6 border">
							<h3 class="text-lg font-semibold mb-2">{tournament.name}</h3>
							<p class="text-sm text-gray-600 mb-2">Type: {tournament.tournamentType}</p>
							<p class="text-sm mb-2">
								Status: <span class={getStatusColor(tournament.status)}>{tournament.status}</span>
							</p>
							<p class="text-sm text-gray-600 mb-2">
								Entry Fee: ${tournament.entryFeeUsdc} USDC
							</p>
							<p class="text-sm text-gray-600 mb-2">
								Participants: {tournament.currentParticipants}/{tournament.maxParticipants}
							</p>

							<p class="text-sm text-gray-600 mb-4">
								Created: {formatTimestamp(tournament.createdAt)}
							</p>
							{#if tournament.status === 'registration_open' && tournament.currentParticipants < tournament.maxParticipants}
								<button 
									onclick={() => joinTournament(tournament.id)}
									class="bg-primary-green hover:bg-dark-green text-black font-bold py-2 px-4 rounded-full w-full cursor-pointer"
								>
									Register
								</button>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</main>

<!-- Create Game Modal -->
{#if showCreateGame}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
		<div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
			<h3 class="text-lg font-bold mb-4">Create New Game</h3>
			<div class="mb-4">
				<label for="gameMode" class="block text-gray-700 text-sm font-bold mb-2">Game Mode:</label>
				<select id="gameMode" bind:value={gameMode} class="w-full px-3 py-2 border rounded">
					<option value="QUICK_MATCH">Quick Match</option>
					<option value="TRADITIONAL_LEAGUE">Traditional League</option>
					<option value="PRICE_PREDICTION">Price Prediction</option>
				</select>
			</div>
			<div class="flex justify-end space-x-2">
				<button 
					onclick={() => showCreateGame = false}
					class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
				>
					Cancel
				</button>
				<button 
					onclick={createGame}
					class="bg-primary-green hover:bg-dark-green text-black font-bold py-2 px-4 rounded-full cursor-pointer"
				>
					Create
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Create Tournament Modal -->
{#if showCreateTournament}
	<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
		<div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
			<h3 class="text-lg font-bold mb-4">Create New Tournament</h3>
			<div class="mb-4">
				<label for="tournamentName" class="block text-gray-700 text-sm font-bold mb-2">Tournament Name:</label>
				<input 
					id="tournamentName"
					bind:value={tournamentName} 
					type="text" 
					class="w-full px-3 py-2 border rounded"
					placeholder="Enter tournament name"
				/>
			</div>
			<div class="mb-4">
				<label for="entryFee" class="block text-gray-700 text-sm font-bold mb-2">Entry Fee (USDC):</label>
				<input 
					id="entryFee"
					bind:value={entryFee} 
					type="number" 
					min="0" 
					class="w-full px-3 py-2 border rounded"
				/>
			</div>
			<div class="mb-4">
				<label for="maxParticipants" class="block text-gray-700 text-sm font-bold mb-2">Max Participants:</label>
				<input 
					id="maxParticipants"
					bind:value={maxParticipants} 
					type="number" 
					min="2" 
					max="64" 
					class="w-full px-3 py-2 border rounded"
				/>
			</div>
			<div class="mb-4">
				<label for="tournamentType" class="block text-gray-700 text-sm font-bold mb-2">Tournament Type:</label>
				<select id="tournamentType" bind:value={tournamentType} class="w-full px-3 py-2 border rounded">
					<option value="SINGLE_ELIMINATION">Single Elimination</option>
					<option value="DOUBLE_ELIMINATION">Double Elimination</option>
					<option value="ROUND_ROBIN">Round Robin</option>
					<option value="SWISS">Swiss System</option>
				</select>
			</div>
			<div class="flex justify-end space-x-2">
				<button 
					onclick={() => showCreateTournament = false}
					class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
				>
					Cancel
				</button>
				<button 
					onclick={createTournament}
					class="bg-primary-green hover:bg-dark-green text-black font-bold py-2 px-4 rounded"
				>
					Create
				</button>
			</div>
		</div>
	</div>
{/if}