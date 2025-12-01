<script lang="ts">
	import { onMount } from 'svelte';
	import { coinDraftsService } from '$lib/coinDraftsService';
	import type { Game } from '$lib/coinDraftsService';
	import { Zap, Plus, DollarSign, Rocket, Flame, Gamepad2 } from '@lucide/svelte';
	import { showToast } from '$lib/stores/toasts';
	import { formatTimestamp } from '$lib/utils/dateFormatter';
	import { wallet } from '$lib/stores/wallet';

	let games: Game[] = $state([]);
	let loading = $state(true);
	let showCreateModal = $state(false);
	let selectedMode = $state('QUICK_MATCH');
	let selectedCryptos = $state<string[]>([]);
	let entryFee = $state(1);
	let maxPlayers = $state(10);
	let creating = $state(false);
	
	const walletState = $derived($wallet);
	
	// Chain selection for joining
	let showChainSelectionModal = $state(false);
	let selectedGameId = $state('');
	let selectedChainId = $state('');
	let connecting = $state(false);

	// Available cryptocurrencies for selection
	const availableCryptos = [
		'Bitcoin (BTC)', 'Ethereum (ETH)', 'Cardano (ADA)', 'Solana (SOL)', 
		'Polkadot (DOT)', 'Chainlink (LINK)', 'Polygon (MATIC)', 'Avalanche (AVAX)',
		'Cosmos (ATOM)', 'Near Protocol (NEAR)', 'Algorand (ALGO)', 'Fantom (FTM)',
		'Hedera (HBAR)', 'Internet Computer (ICP)', 'VeChain (VET)', 'Tezos (XTZ)'
	];

	function toggleCrypto(crypto: string) {
		if (selectedCryptos.includes(crypto)) {
			selectedCryptos = selectedCryptos.filter(c => c !== crypto);
		} else if (selectedCryptos.length < 5) {
			selectedCryptos = [...selectedCryptos, crypto];
		}
	}

	onMount(async () => {
		await loadGames();
	});

	async function loadGames() {
		try {
			loading = true;
			const allGames = await coinDraftsService.fetchGames();
			// Filter for QUICK_MATCH games only
			games = allGames.filter(game => game.mode === 'QUICK_MATCH');
		} catch (error) {
			console.error('Error loading games:', error);
		} finally {
			loading = false;
		}
	}

	async function createGame() {
		// Validate form
		if (selectedCryptos.length === 0) {
			showToast('Please select at least 1 cryptocurrency', 'error');
			return;
		}
		
		if (entryFee < 1 || entryFee > 100) {
			showToast('Entry fee must be between $1 and $100', 'error');
			return;
		}

		if (maxPlayers < 5 || maxPlayers > 20) {
			showToast('Max players must be between 5 and 20', 'error');
			return;
		}
		
		try {
			creating = true;
			console.log('Creating game with data:', {
				mode: selectedMode,
				cryptos: selectedCryptos,
				entryFee,
				maxPlayers
			});
			
			const result = await coinDraftsService.createGame(selectedMode);
			console.log('Game creation result:', result);
			
			if (result.success) {
				showToast('Game created successfully!', 'success');
				showCreateModal = false;
				selectedCryptos = [];
				entryFee = 1;
				maxPlayers = 10;
				await loadGames();
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
		// If wallet is connected, join directly
		if (walletState.isConnected && walletState.chainId) {
			try {
				connecting = true;
				const result = await coinDraftsService.registerPlayer(gameId, walletState.chainId);
				
				if (result.success) {
					showToast('Successfully joined game!', 'success');
					await loadGames();
				} else {
					showToast('Failed to join game. Please try again.', 'error');
				}
			} catch (error) {
				console.error('Error joining game:', error);
				showToast('Error joining game. Please try again.', 'error');
			} finally {
				connecting = false;
			}
		} else {
			// Show chain selection modal if wallet not connected
			showChainSelectionModal = true;
			selectedGameId = gameId;
			selectedChainId = ''; // Reset
		}
	}

	async function connectToChainAndJoinGame() {
		if (!selectedChainId) {
			showToast('Please select a chain first', 'error');
			return;
		}

		try {
			connecting = true;
			
			// Use the player's chain ID as their identifier
			const result = await coinDraftsService.registerPlayer(selectedGameId, selectedChainId);
			
			if (result.success) {
				showToast(`Successfully joined game using chain ${selectedChainId}!`, 'success');
				showChainSelectionModal = false;
				await loadGames(); // Refresh the games list
			} else {
				showToast('Failed to join game. Please try again.', 'error');
			}
		} catch (error) {
			console.error('Error joining game:', error);
			showToast('Error joining game. Please try again.', 'error');
		} finally {
			connecting = false;
		}
	}
</script>

<svelte:head>
	<title>Quick Match - CoinDrafts</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
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
			class="bg-primary-green hover:bg-dark-green text-black font-bold py-3 px-6 rounded-full transition-colors cursor-pointer flex items-center gap-2 border-2 border-primary-green"
			style="background-color: #39ff14 !important; color: black !important; display: flex !important; visibility: visible !important;"
		>
			<Plus class="w-5 h-5" />
			🚀 CREATE GAME NOW 🚀
		</button>
	</div>

	<!-- Game Info Cards -->
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

	<!-- Active Games -->
	{#if loading}
		<div class="text-center py-12">
			<div class="text-text-secondary text-lg">Loading active games...</div>
		</div>
	{:else if games.length === 0}
		<div class="text-center py-12">
			<div class="flex justify-center mb-4">
				<Zap class="w-24 h-24 text-primary-green" />
			</div>
			<h3 class="text-2xl font-semibold text-white mb-4">No Active Quick Matches</h3>
			<p class="text-text-secondary mb-8 max-w-md mx-auto">
				Be the first to start a quick match! Create a game and invite others to compete in real-time cryptocurrency portfolio contests.
			</p>
			<button
				onclick={() => showCreateModal = true}
				class="bg-primary-green hover:bg-dark-green text-black font-bold py-4 px-8 rounded-full text-lg transition-colors cursor-pointer flex items-center gap-2 mx-auto"
			>
				<Plus class="w-6 h-6" />
				Create First Game
			</button>
		</div>
	{:else}
		<div>
			<h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
				<Flame class="w-8 h-8 text-primary-green" />
				Active Games ({games.length})
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each games as game}
					<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30 hover:border-primary-green/50 transition-all duration-200 hover:transform hover:scale-105">
						<!-- Game Header -->
						<div class="flex justify-between items-start mb-4">
							<div>
								<h3 class="text-lg font-semibold text-white">Game #{game.gameId.slice(-6)}</h3>
								<p class="text-sm text-text-secondary">{game.mode}</p>
							</div>
							<span class="text-xs px-3 py-1 rounded-full border {
								game.status === 'Active' ? 'bg-primary-green/20 text-primary-green border-primary-green/30' :
								game.status === 'Pending' ? 'bg-primary-green/10 text-text-secondary border-border-color' :
								'bg-gray-500/20 text-gray-300 border-gray-500/30'
							}">
								{game.status}
							</span>
						</div>

						<!-- Game Stats -->
						<div class="space-y-3 mb-6">
							<div class="flex justify-between text-sm">
								<span class="text-text-secondary">Players:</span>
								<span class="text-white font-medium">{game.playerCount}/{game.maxPlayers}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-text-secondary">Created:</span>
								<span class="text-white font-medium">
									{formatTimestamp(game.createdAt)}
								</span>
							</div>
						</div>

						<!-- Player Progress Bar -->
						<div class="mb-6">
							<div class="flex justify-between text-xs text-text-secondary mb-1">
								<span>Slots Filled</span>
								<span>{Math.round((game.playerCount / game.maxPlayers) * 100)}%</span>
							</div>
							<div class="w-full bg-white/20 rounded-full h-2">
								<div 
									class="bg-primary-green h-2 rounded-full transition-all duration-300"
									style="width: {(game.playerCount / game.maxPlayers) * 100}%"
								></div>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-2">
							<button 
								onclick={() => joinGame(game.gameId)}
								class="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded-full transition-colors font-medium cursor-pointer"
							>
								Join Game
							</button>
							<a 
								href="/games/{game.gameId}"
								class="flex-1 bg-primary-green hover:bg-dark-green text-black text-center py-2 rounded-full transition-colors font-medium cursor-pointer"
							>
								View Game
							</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- How Quick Match Works -->
	<div class="mt-16">
		<h2 class="text-3xl font-bold text-white mb-8 text-center">How Quick Match Works</h2>
		<div class="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
			<div class="text-center">
				<div class="w-12 h-12 rounded-full bg-primary-green flex items-center justify-center mx-auto mb-4">
					<span class="text-black font-bold">1</span>
				</div>
				<h3 class="font-semibold text-white mb-2">Pick 5 Cryptos</h3>
				<p class="text-sm text-text-secondary">Select your top 5 cryptocurrencies</p>
			</div>
			<div class="text-center">
				<div class="w-12 h-12 rounded-full bg-primary-green flex items-center justify-center mx-auto mb-4">
					<span class="text-black font-bold">2</span>
				</div>
				<h3 class="font-semibold text-white mb-2">24-Hour Window</h3>
				<p class="text-sm text-text-secondary">Game runs for exactly 24 hours</p>
			</div>
			<div class="text-center">
				<div class="w-12 h-12 rounded-full bg-primary-green flex items-center justify-center mx-auto mb-4">
					<span class="text-black font-bold">3</span>
				</div>
				<h3 class="font-semibold text-white mb-2">Real-Time Tracking</h3>
				<p class="text-sm text-text-secondary">Watch live price movements</p>
			</div>
			<div class="text-center">
				<div class="w-12 h-12 rounded-full bg-primary-green flex items-center justify-center mx-auto mb-4">
					<span class="text-black font-bold">4</span>
				</div>
				<h3 class="font-semibold text-white mb-2">Instant Payout</h3>
				<p class="text-sm text-text-secondary">Winners paid immediately</p>
			</div>
		</div>
	</div>
</div>

<!-- Create Game Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30 max-w-md w-full">
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
						<label class="flex items-center space-x-3 opacity-50">
							<input 
								type="radio" 
								disabled
								class="text-primary-green"
							>
							<div>
								<div class="text-white font-medium">Price Prediction</div>
								<div class="text-sm text-text-secondary">Coming soon...</div>
							</div>
						</label>
					</div>
				</div>

				<!-- Cryptocurrency Selection -->
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-3">
						Select Cryptocurrencies ({selectedCryptos.length}/5)
					</label>
					<div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-white/5 rounded-lg p-3 border border-white/20">
						{#each availableCryptos as crypto}
							<button
								type="button"
								onclick={() => toggleCrypto(crypto)}
								class="text-left p-2 rounded-lg text-sm transition-all cursor-pointer {
									selectedCryptos.includes(crypto) 
										? 'bg-primary-green text-black font-medium' 
										: 'bg-white/10 text-white hover:bg-white/20'
								} {selectedCryptos.length >= 5 && !selectedCryptos.includes(crypto) ? 'opacity-50 cursor-not-allowed' : ''}"
								disabled={selectedCryptos.length >= 5 && !selectedCryptos.includes(crypto)}
							>
								{crypto}
							</button>
						{/each}
					</div>
				</div>

				<!-- Game Settings -->
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="entry-fee" class="block text-sm font-medium text-text-secondary mb-2">Entry Fee ($)</label>
						<input 
							id="entry-fee"
							bind:value={entryFee}
							type="number" 
							min="1"
							max="100"
							class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white"
						>
					</div>
					<div>
						<label for="max-players" class="block text-sm font-medium text-text-secondary mb-2">Max Players</label>
						<select id="max-players" bind:value={maxPlayers} class="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white">
							<option value={5}>5 Players</option>
							<option value={10}>10 Players</option>
							<option value={15}>15 Players</option>
							<option value={20}>20 Players</option>
						</select>
					</div>
				</div>

				<div class="bg-primary-green/20 border border-primary-green/30 rounded-lg p-4">
					<h4 class="text-white font-medium mb-2">Quick Match Rules:</h4>
					<ul class="text-sm text-text-secondary space-y-1">
						<li>• Select up to 5 cryptocurrencies ✓</li>
						<li>• 24-hour competition period</li>
						<li>• Real-time price tracking</li>
						<li>• Winners based on portfolio % gain</li>
					</ul>
				</div>
				
				<div class="flex gap-4">
					<button 
						onclick={() => showCreateModal = false}
						class="flex-1 border border-white/30 text-white hover:bg-white/10 py-3 rounded-full transition-colors cursor-pointer"
					>
						Cancel
					</button>
					<button 
						onclick={createGame}
						disabled={selectedCryptos.length === 0 || creating}
						class="flex-1 py-3 rounded-full transition-colors font-bold {
							(selectedCryptos.length === 0 || creating)
								? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
								: 'bg-primary-green hover:bg-dark-green text-black cursor-pointer'
						}"
					>
						{creating ? 'Creating Game...' : `Create Game ${selectedCryptos.length > 0 ? `(${selectedCryptos.length} cryptos)` : ''}`}
					</button>
				</div>
			</div>
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
					CoinDrafts uses your personal microchain for complete data sovereignty. Select which chain to use for this game.
				</p>
				
				<div>
					<label for="game-chain-id" class="block text-sm font-medium text-text-secondary mb-2">
						Player Chain ID
					</label>
					<input 
						id="game-chain-id"
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
					onclick={connectToChainAndJoinGame}
					disabled={connecting || !selectedChainId.trim()}
					class="flex-1 py-2 rounded-full transition-colors font-bold {
						(connecting || !selectedChainId.trim())
							? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
							: 'bg-primary-green hover:bg-dark-green text-black cursor-pointer'
					}"
				>
					{connecting ? 'Connecting...' : 'Join Game'}
				</button>
			</div>
		</div>
	</div>
{/if}