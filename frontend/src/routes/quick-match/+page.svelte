<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { coinDraftsService } from '$lib/coinDraftsService';
	import type { Game } from '$lib/coinDraftsService';
	import { Zap, Plus, DollarSign, Rocket } from '@lucide/svelte';
	import { showToast } from '$lib/stores/toasts';
	import { formatTimestamp } from '$lib/utils/dateFormatter';
	import { wallet } from '$lib/stores/wallet';

	let games: Game[] = $state([]);
	let loading = $state(true);
	let showCreateModal = $state(false);
	let selectedMode = $state('QUICK_MATCH');
	let selectedCryptos = $state<string[]>([]);
	let creating = $state(false);
	
	const walletState = $derived($wallet);
	
	let showPortfolioModal = $state(false);
	let joiningGameId = $state('');
	let portfolioCryptos = $state<string[]>([]);
	let submitting = $state(false);

	const availableCryptos = [
		{ name: 'Bitcoin', id: 'bitcoin' },
		{ name: 'Ethereum', id: 'ethereum' },
		{ name: 'Cardano', id: 'cardano' },
		{ name: 'Solana', id: 'solana' },
		{ name: 'Polkadot', id: 'polkadot' },
		{ name: 'Chainlink', id: 'chainlink' },
		{ name: 'Polygon', id: 'polygon' },
		{ name: 'Avalanche', id: 'avalanche' },
		{ name: 'Cosmos', id: 'cosmos' },
		{ name: 'Near Protocol', id: 'near' },
		{ name: 'Algorand', id: 'algorand' },
		{ name: 'Fantom', id: 'fantom' },
		{ name: 'Hedera', id: 'hedera' },
		{ name: 'Internet Computer', id: 'internet-computer' },
		{ name: 'VeChain', id: 'vechain' },
		{ name: 'Tezos', id: 'tezos' }
	];

	function toggleCrypto(cryptoId: string) {
		if (selectedCryptos.includes(cryptoId)) {
			selectedCryptos = selectedCryptos.filter(c => c !== cryptoId);
		} else if (selectedCryptos.length < 5) {
			selectedCryptos = [...selectedCryptos, cryptoId];
		}
	}

	function togglePortfolioCrypto(cryptoId: string) {
		if (portfolioCryptos.includes(cryptoId)) {
			portfolioCryptos = portfolioCryptos.filter(c => c !== cryptoId);
		} else if (portfolioCryptos.length < 5) {
			portfolioCryptos = [...portfolioCryptos, cryptoId];
		}
	}

	onMount(async () => {
		await loadGames();
	});

	async function loadGames() {
		try {
			loading = true;
			const allGames = await coinDraftsService.fetchGames();
			games = allGames.filter(game => game.mode === 'QUICK_MATCH');
		} catch (error) {
			console.error('Error loading games:', error);
		} finally {
			loading = false;
		}
	}

	async function createGame() {
		if (selectedCryptos.length === 0) {
			showToast('Please select at least 1 cryptocurrency', 'error');
			return;
		}
		
		try {
			creating = true;
			const result = await coinDraftsService.createGame(selectedMode);
			
			if (result.success) {
				showToast('Game created! Redirecting...', 'success');
				showCreateModal = false;
				selectedCryptos = [];
				// Get the latest games to find the newly created one
				const allGames = await coinDraftsService.fetchGames();
				const quickMatchGames = allGames.filter(game => game.mode === 'QUICK_MATCH');
				if (quickMatchGames.length > 0) {
					// Get the most recent game (last in array)
					const latestGame = quickMatchGames[quickMatchGames.length - 1];
					await goto(`/games/${latestGame.gameId}`);
				} else {
					await loadGames();
				}
			} else {
				showToast('Failed to create game. Please try again.', 'error');
			}
		} catch (error) {
			console.error('Error creating game:', error);
			showToast('Error creating game. Check console for details.', 'error');
		} finally {
			creating = false;
		}
	}

	async function joinGame(gameId: string) {
		joiningGameId = gameId;
		portfolioCryptos = [];
		showPortfolioModal = true;
	}

	async function submitGamePortfolio() {
		if (portfolioCryptos.length !== 5) {
			showToast('Please select exactly 5 cryptocurrencies', 'error');
			return;
		}

		if (!walletState.chainId) {
			showToast('Please connect your wallet first', 'error');
			return;
		}

		try {
			submitting = true;

			const registerResult = await coinDraftsService.registerPlayer(joiningGameId, walletState.chainId);

			if (!registerResult.success) {
				showToast('Failed to register for game', 'error');
				return;
			}

			const portfolioResult = await coinDraftsService.submitPortfolio(joiningGameId, portfolioCryptos);

			if (portfolioResult.success) {
				showToast('Successfully joined game and submitted portfolio!', 'success');
				showPortfolioModal = false;
				portfolioCryptos = [];
				// Redirect to game page to see updated state
				await goto(`/games/${joiningGameId}`);
			} else {
				showToast('Registered but portfolio submission failed', 'error');
			}
		} catch (error) {
			console.error('Error submitting portfolio:', error);
			showToast('Error submitting portfolio. Please try again.', 'error');
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Quick Match - CoinDrafts</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="flex flex-col md:flex-row justify-between items-center mb-8">
		<div>
			<h1 class="text-4xl font-bold text-white mb-2 flex items-center gap-3">
				<Zap class="w-10 h-10 text-primary-green" />
				Quick Match
			</h1>
			<p class="text-text-secondary">Fast-paced 24-hour cryptocurrency portfolio contests</p>
		</div>
		<button 
			onclick={() => showCreateModal = true}
			class="bg-[#39ff14] hover:bg-[#0bd10b] text-black font-bold py-3 px-6 rounded-full transition-colors cursor-pointer flex items-center gap-2"
		>
			<Plus class="w-5 h-5" />
			CREATE GAME
		</button>
	</div>

	<div class="grid md:grid-cols-3 gap-6 mb-8">
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30">
			<div class="flex justify-center mb-3">
				<Zap class="w-8 h-8 text-primary-green" />
			</div>
			<h3 class="text-lg font-semibold text-white mb-2">24-Hour Duration</h3>
			<p class="text-text-secondary text-sm">Games run for exactly 24 hours from start time</p>
		</div>
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30">
			<div class="flex justify-center mb-3">
				<DollarSign class="w-8 h-8 text-primary-green" />
			</div>
			<h3 class="text-lg font-semibold text-white mb-2">Low Entry Fees</h3>
			<p class="text-text-secondary text-sm">Start with as little as $1 entry fee</p>
		</div>
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30">
			<div class="flex justify-center mb-3">
				<Rocket class="w-8 h-8 text-primary-green" />
			</div>
			<h3 class="text-lg font-semibold text-white mb-2">Instant Results</h3>
			<p class="text-text-secondary text-sm">Winners determined as soon as games end</p>
		</div>
	</div>

	{#if loading}
		<div class="text-center py-12">
			<div class="text-text-secondary text-lg">Loading active games...</div>
		</div>
	{:else if games.length === 0}
		<div class="text-center py-12">
			<div class="flex justify-center mb-4">
				<Zap class="w-24 h-24 text-primary-green" />
			</div>
			<h2 class="text-2xl font-semibold text-white mb-2">No Active Games</h2>
			<p class="text-text-secondary mb-6">Be the first to create a Quick Match game!</p>
			<button 
				onclick={() => showCreateModal = true}
				class="bg-[#39ff14] hover:bg-[#0bd10b] text-black font-bold py-3 px-8 rounded-full transition-colors cursor-pointer"
			>
				Create Your First Game
			</button>
		</div>
	{:else}
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each games as game}
				<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-primary-green/50 transition-colors">
					<div class="flex justify-between items-start mb-4">
						<div>
							<h3 class="text-xl font-bold text-white mb-1">Game #{game.gameId.slice(0, 8)}</h3>
							<p class="text-sm text-text-secondary">{game.mode}</p>
						</div>
						<span class="px-3 py-1 bg-primary-green/20 text-primary-green text-xs font-semibold rounded-full">
							{game.status}
						</span>
					</div>
					
				<div class="space-y-2 mb-4">
					<div class="flex justify-between text-sm">
						<span class="text-text-secondary">Players</span>
						<span class="text-white font-medium">{game.playerCount}/{game.maxPlayers}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-text-secondary">Entry Fee</span>
						<span class="text-white font-medium">$5</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-text-secondary">Prize Pool</span>
						<span class="text-primary-green font-bold">${game.playerCount * 5}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-text-secondary">Starts</span>
						<span class="text-white font-medium">{formatTimestamp(game.createdAt)}</span>
					</div>
				</div>				<button 
					onclick={() => goto(`/games/${game.gameId}`)}
					class="w-full bg-[#39ff14] hover:bg-[#0bd10b] text-black font-bold py-3 rounded-full transition-colors cursor-pointer"
				>
					{game.status === 'PENDING' ? 'View & Join Game' : 'View Game'}
				</button>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mt-12 bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
		<h2 class="text-2xl font-bold text-white mb-4">How It Works</h2>
		<div class="space-y-4 text-text-secondary">
			<div class="flex gap-4">
				<div class="flex-shrink-0 w-8 h-8 bg-primary-green text-black font-bold rounded-full flex items-center justify-center">1</div>
				<div>
					<h3 class="text-white font-semibold mb-1">Create or Join</h3>
					<p class="text-sm">Start your own game or join an existing Quick Match</p>
				</div>
			</div>
			<div class="flex gap-4">
				<div class="flex-shrink-0 w-8 h-8 bg-primary-green text-black font-bold rounded-full flex items-center justify-center">2</div>
				<div>
					<h3 class="text-white font-semibold mb-1">Select Portfolio</h3>
					<p class="text-sm">Choose 5 cryptocurrencies you think will perform best</p>
				</div>
			</div>
			<div class="flex gap-4">
				<div class="flex-shrink-0 w-8 h-8 bg-primary-green text-black font-bold rounded-full flex items-center justify-center">3</div>
				<div>
					<h3 class="text-white font-semibold mb-1">Wait 24 Hours</h3>
					<p class="text-sm">The game runs for exactly 24 hours tracking performance</p>
				</div>
			</div>
			<div class="flex gap-4">
				<div class="flex-shrink-0 w-8 h-8 bg-primary-green text-black font-bold rounded-full flex items-center justify-center">4</div>
				<div>
					<h3 class="text-white font-semibold mb-1">Win Prizes</h3>
					<p class="text-sm">Top performers split the prize pool based on rankings</p>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Create Game Modal -->
{#if showCreateModal}
	<div 
		class="fixed inset-0 bg-black/70 flex items-start justify-center z-50 overflow-y-auto"
		onclick={(e) => { if (e.target === e.currentTarget) showCreateModal = false; }}
	>
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30 max-w-md w-full my-8">
			<h2 class="text-2xl font-bold text-white mb-6">Create Quick Match</h2>
			
			<div class="space-y-6">
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-3">Game Mode</label>
					<div class="space-y-2">
						<label class="flex items-center space-x-3">
							<input 
								type="radio" 
								bind:group={selectedMode} 
								value="QUICK_MATCH"
								class="text-primary-green"
							>
							<div>
								<div class="text-white font-medium">Quick Match</div>
								<div class="text-sm text-text-secondary">24-hour portfolio contest</div>
							</div>
						</label>
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-text-secondary mb-3">
						Select Cryptocurrencies ({selectedCryptos.length}/5)
					</label>
					<div class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto bg-white/5 rounded-lg p-3 border border-white/20">
						{#each availableCryptos as crypto}
						<button
							type="button"
							onclick={() => toggleCrypto(crypto.id)}
							class="text-left p-2 rounded-lg text-sm transition-all cursor-pointer {
								selectedCryptos.includes(crypto.id) 
									? 'bg-[#39ff14] text-black font-medium' 
									: 'bg-white/10 text-white hover:bg-white/20'
							} {selectedCryptos.length >= 5 && !selectedCryptos.includes(crypto.id) ? 'opacity-50 cursor-not-allowed' : ''}"
							disabled={selectedCryptos.length >= 5 && !selectedCryptos.includes(crypto.id)}
						>
							{crypto.name}
						</button>
						{/each}
					</div>
				</div>
			</div>
			
			<div class="flex gap-4 mt-6">
				<button 
					onclick={() => { showCreateModal = false; selectedCryptos = []; }}
					class="flex-1 border border-white/30 text-white hover:bg-white/10 py-3 rounded-full transition-colors cursor-pointer"
				>
					Cancel
				</button>
				<button 
					onclick={createGame}
					disabled={creating || selectedCryptos.length === 0}
					class="flex-1 py-3 rounded-full transition-colors font-bold {
						(creating || selectedCryptos.length === 0)
							? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
							: 'bg-[#39ff14] hover:bg-[#0bd10b] text-black cursor-pointer'
					}"
				>
					{creating ? 'Creating...' : 'Create Game'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Portfolio Selection Modal -->
{#if showPortfolioModal}
	<div 
		class="fixed inset-0 bg-black/70 flex items-start justify-center z-50 overflow-y-auto"
		onclick={(e) => { if (e.target === e.currentTarget) { showPortfolioModal = false; portfolioCryptos = []; } }}
	>
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30 max-w-md w-full my-8">
			<h2 class="text-2xl font-bold text-white mb-6">Select Your Portfolio</h2>
			
			<div class="space-y-4 mb-6">
				<p class="text-text-secondary text-sm">
					Choose exactly 5 cryptocurrencies for this game. Your portfolio performance will determine your ranking!
				</p>
				
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-3">
						Select Cryptocurrencies ({portfolioCryptos.length}/5)
					</label>
					<div class="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto bg-white/5 rounded-lg p-3 border border-white/20">
						{#each availableCryptos as crypto}
						<button
							type="button"
							onclick={() => togglePortfolioCrypto(crypto.id)}
							class="text-left p-2 rounded-lg text-sm transition-all cursor-pointer {
								portfolioCryptos.includes(crypto.id) 
									? 'bg-[#39ff14] text-black font-medium' 
									: 'bg-white/10 text-white hover:bg-white/20'
							} {portfolioCryptos.length >= 5 && !portfolioCryptos.includes(crypto.id) ? 'opacity-50 cursor-not-allowed' : ''}"
							disabled={portfolioCryptos.length >= 5 && !portfolioCryptos.includes(crypto.id)}
						>
							{crypto.name}
						</button>
						{/each}
					</div>
				</div>
				
				{#if !walletState.isConnected}
					<div class="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
						<p class="text-xs text-yellow-200">
							Please connect your wallet to join this game
						</p>
					</div>
				{/if}
			</div>
			
			<div class="flex gap-4">
				<button 
					type="button"
					onclick={() => { showPortfolioModal = false; portfolioCryptos = []; }}
					class="flex-1 border border-white/30 text-white hover:bg-white/10 py-3 rounded-full transition-colors cursor-pointer"
				>
					Cancel
				</button>
				<button 
					onclick={submitGamePortfolio}
					disabled={submitting || portfolioCryptos.length !== 5 || !walletState.isConnected}
					class="flex-1 py-3 rounded-full transition-colors font-bold {
						(submitting || portfolioCryptos.length !== 5 || !walletState.isConnected)
							? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
							: 'bg-[#39ff14] hover:bg-[#0bd10b] text-black cursor-pointer'
					}"
				>
					{submitting ? 'Submitting...' : 'Join & Submit'}
				</button>
			</div>
		</div>
	</div>
{/if}
