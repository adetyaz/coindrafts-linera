<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { coinDraftsService, type Game, type PlayerProfile, type Portfolio, type PriceSnapshotInput } from '$lib/coinDraftsService';
	import { Trophy, Users, DollarSign, Calendar, Gamepad2, ArrowLeft, Target, Play, StopCircle, TrendingUp } from '@lucide/svelte';
	import { wallet } from '$lib/stores/wallet';
	import { showToast } from '$lib/stores/toasts';
	import GameWinnersDisplay from '$lib/components/GameWinnersDisplay.svelte';
	import TournamentChart from '$lib/components/TournamentChart.svelte';
	import { getPriceSnapshot } from '$lib/services/priceService';

	const gameId = page.params.gameId;
	
	let game = $state<Game | null>(null);
	let players = $state<PlayerProfile[]>([]);
	let portfolios = $state<Portfolio[]>([]);
	let loading = $state(true);
	let error = $state('');
	let showPortfolioModal = $state(false);
	let portfolioCryptos = $state<string[]>([]);
	let submitting = $state(false);
	let startingGame = $state(false);
	let endingGame = $state(false);
	
	const walletState = $derived($wallet);

	const availableCryptos = [
		{ name: 'Bitcoin', id: 'bitcoin', symbol: 'BTC' },
		{ name: 'Ethereum', id: 'ethereum', symbol: 'ETH' },
		{ name: 'Cardano', id: 'cardano', symbol: 'ADA' },
		{ name: 'Solana', id: 'solana', symbol: 'SOL' },
		{ name: 'Polkadot', id: 'polkadot', symbol: 'DOT' },
		{ name: 'Chainlink', id: 'chainlink', symbol: 'LINK' },
		{ name: 'Polygon', id: 'polygon', symbol: 'MATIC' },
		{ name: 'Avalanche', id: 'avalanche-2', symbol: 'AVAX' },
		{ name: 'Cosmos', id: 'cosmos', symbol: 'ATOM' },
		{ name: 'Near Protocol', id: 'near', symbol: 'NEAR' },
		{ name: 'Algorand', id: 'algorand', symbol: 'ALGO' },
		{ name: 'Fantom', id: 'fantom', symbol: 'FTM' },
		{ name: 'Hedera', id: 'hedera', symbol: 'HBAR' },
		{ name: 'Internet Computer', id: 'internet-computer', symbol: 'ICP' },
		{ name: 'VeChain', id: 'vechain', symbol: 'VET' },
		{ name: 'Tezos', id: 'tezos', symbol: 'XTZ' }
	];

	onMount(async () => {
		await loadGameDetails();
	});

	async function loadGameDetails() {
		try {
			loading = true;
			error = '';
			
			if (!gameId) {
				error = 'Invalid game ID';
				return;
			}
			
			// Load game details
			game = await coinDraftsService.fetchGame(gameId);
			
			if (!game) {
				error = 'Game not found';
				return;
			}

			

			// Load portfolios for this game
			portfolios = await coinDraftsService.fetchPortfolios(gameId);
	
			// Load all players and filter to only those with portfolios in THIS game
			const allPlayers = await coinDraftsService.fetchPlayers();
			const playerAccountsInGame = new Set(portfolios.map(p => p.playerAccount));
			players = allPlayers.filter(p => playerAccountsInGame.has(p.account));
			
		} catch (err) {
			console.error('Failed to load game details:', err);
			error = 'Failed to load game details';
		} finally {
			loading = false;
		}
	}

	async function joinGame() {
		portfolioCryptos = [];
		showPortfolioModal = true;
	}

	function togglePortfolioCrypto(cryptoId: string) {
		if (portfolioCryptos.includes(cryptoId)) {
			portfolioCryptos = portfolioCryptos.filter(c => c !== cryptoId);
		} else if (portfolioCryptos.length < 5) {
			portfolioCryptos = [...portfolioCryptos, cryptoId];
		}
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

		if (!gameId) {
			showToast('Invalid game ID', 'error');
			return;
		}

		try {
			submitting = true;

			const registerResult = await coinDraftsService.registerPlayer(gameId, walletState.chainId);

			if (!registerResult.success) {
				showToast('Failed to register for game', 'error');
				return;
			}

			// Send crypto IDs directly (matches backend price snapshot format)
			const portfolioResult = await coinDraftsService.submitPortfolio(gameId, portfolioCryptos);

			if (portfolioResult.success) {
				showToast('Successfully joined game and submitted portfolio!', 'success');
				showPortfolioModal = false;
				portfolioCryptos = [];
				
				// Wait for blockchain propagation then reload
				await new Promise((resolve) => setTimeout(resolve, 2000));
				window.location.reload();
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

	function getStatusColor(status: string): string {
		switch (status) {
			case 'WAITING_FOR_PLAYERS':
			case 'WaitingForPlayers': 
			case 'PENDING': 
				return 'text-green-400';
			case 'ACTIVE':
			case 'Active': 
				return 'text-yellow-400';
			case 'COMPLETED':
			case 'Completed': 
				return 'text-blue-400';
			default: return 'text-gray-400';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'WAITING_FOR_PLAYERS':
			case 'WaitingForPlayers': 
			case 'PENDING':
				return Users;
			case 'ACTIVE':
			case 'Active': 
				return Target;
			case 'COMPLETED':
			case 'Completed': 
				return Trophy;
			default: return Calendar;
		}
	}

	function getModeDisplayName(mode: string): string {
		switch (mode) {
			case 'QUICK_MATCH': return 'Quick Match';
			case 'TRADITIONAL_LEAGUE': return 'Traditional League';
			case 'PRICE_PREDICTION': return 'Price Prediction';
			default: return mode;
		}
	}

	async function handleStartGame() {
		if (!gameId) {
			showToast('Invalid game ID', 'error');
			return;
		}

		try {
			startingGame = true;
			
			// Get real-time prices for all cryptos
			const cryptoIds = ['bitcoin', 'ethereum', 'solana', 'cardano', 'polkadot', 
				'chainlink', 'polygon', 'avalanche-2', 'cosmos', 'near', 
				'algorand', 'fantom', 'hedera', 'internet-computer', 'vechain', 'tezos'];
			
			const snapshot = await getPriceSnapshot(cryptoIds);
			
			// Convert to backend format (micro-USDC)
			const priceSnapshot: PriceSnapshotInput[] = Object.entries(snapshot.prices).map(([cryptoId, priceUsd]) => ({
				cryptoId,
				priceUsd: Math.floor(priceUsd * 1_000_000), // Convert to micro-USDC
				timestamp: snapshot.timestamp
			}));

			const result = await coinDraftsService.startGame(gameId, priceSnapshot);

			if (result.success) {
				showToast('Game started successfully!', 'success');
				// Wait for blockchain to propagate
				await new Promise(resolve => setTimeout(resolve, 2000));
				window.location.reload();
			} else {
				showToast('Failed to start game', 'error');
			}
		} catch (error) {
			console.error('Error starting game:', error);
			showToast('Error starting game. Please try again.', 'error');
		} finally {
			startingGame = false;
		}
	}

	async function handleEndGame() {
		if (!gameId) {
			showToast('Invalid game ID', 'error');
			return;
		}

		try {
			endingGame = true;
			
			// Get real-time prices for all cryptos
			const cryptoIds = ['bitcoin', 'ethereum', 'solana', 'cardano', 'polkadot', 
				'chainlink', 'polygon', 'avalanche-2', 'cosmos', 'near', 
				'algorand', 'fantom', 'hedera', 'internet-computer', 'vechain', 'tezos'];
			
			const snapshot = await getPriceSnapshot(cryptoIds);
			
			// Convert to backend format (micro-USDC)
			const priceSnapshot: PriceSnapshotInput[] = Object.entries(snapshot.prices).map(([cryptoId, priceUsd]) => ({
				cryptoId,
				priceUsd: Math.floor(priceUsd * 1_000_000), // Convert to micro-USDC
				timestamp: snapshot.timestamp
			}));

			const result = await coinDraftsService.endGame(gameId, priceSnapshot);

			if (result.success) {
				showToast('Game ended successfully! Calculating winners...', 'success');
				// Wait for blockchain to propagate
				await new Promise(resolve => setTimeout(resolve, 2000));
				window.location.reload();
			} else {
				showToast('Failed to end game', 'error');
			}
		} catch (error) {
			console.error('Error ending game:', error);
			showToast('Error ending game. Please try again.', 'error');
		} finally {
			endingGame = false;
		}
	}
</script>

<div class="min-h-screen bg-black text-green-400 p-6">
	<div class="max-w-4xl mx-auto">
		<!-- Header with Back Button -->
		<div class="flex items-center gap-4 mb-8">
			<a href="/quick-match" class="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors">
				<ArrowLeft size={20} />
				Back to Games
			</a>
		</div>

		{#if loading}
			<div class="flex justify-center items-center py-20">
				<div class="text-green-400 text-xl">Loading game details...</div>
			</div>
		{:else if error}
			<div class="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
				<div class="text-red-400 text-xl mb-4">{error}</div>
				<button 
					onclick={loadGameDetails}
					class="bg-green-600 hover:bg-green-700 text-black px-6 py-2 rounded-full font-semibold transition-colors cursor-pointer"
				>
					Retry
				</button>
			</div>
		{:else if game}
			<!-- Game Header -->
			<div class="bg-gray-900 rounded-lg p-6 mb-8 border border-green-500/20">
				<div class="flex items-start justify-between mb-4">
					<div>
						<h1 class="text-3xl font-bold text-green-400 mb-2">Game {game.gameId}</h1>
						<div class="flex items-center gap-2 text-lg">
							{#if game.status === 'WaitingForPlayers'}
								<Users size={20} />
							{:else if game.status === 'Active'}
								<Target size={20} />
							{:else if game.status === 'Completed'}
								<Trophy size={20} />
							{:else}
								<Calendar size={20} />
							{/if}
							<span class={getStatusColor(game.status)}>{game.status}</span>
						</div>
					</div>
					
					<div class="flex gap-3">
						{#if game.status === 'WAITING_FOR_PLAYERS' || game.status === 'WaitingForPlayers' || game.status === 'PENDING'}
							<button 
								onclick={joinGame}
								class="bg-[#39ff14] hover:bg-[#0bd10b] text-black px-6 py-3 rounded-full font-semibold transition-colors cursor-pointer flex items-center gap-2"
							>
								<Users size={20} />
								Join Game
							</button>
							<button 
								onclick={handleStartGame}
								disabled={startingGame || (game.playerCount || 0) === 0}
								class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold transition-colors cursor-pointer flex items-center gap-2"
							>
								<Play size={20} />
								{startingGame ? 'Starting...' : 'Start Game'}
							</button>
						{:else if game.status === 'ACTIVE' || game.status === 'Active'}
							<button 
								onclick={handleEndGame}
								disabled={endingGame}
								class="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold transition-colors cursor-pointer flex items-center gap-2"
							>
								<StopCircle size={20} />
								{endingGame ? 'Ending...' : 'End Game'}
							</button>
						{/if}
					</div>
				</div>

				<!-- Game Details Grid -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="flex items-center gap-3 bg-black/30 rounded-lg p-4">
						<Gamepad2 size={24} class="text-green-400" />
						<div>
							<div class="text-sm text-gray-400">Game Mode</div>
							<div class="text-lg font-semibold">{getModeDisplayName(game.mode)}</div>
						</div>
					</div>

					<div class="flex items-center gap-3 bg-black/30 rounded-lg p-4">
						<Users size={24} class="text-green-400" />
						<div>
							<div class="text-sm text-gray-400">Players</div>
							<div class="text-lg font-semibold">{game.playerCount || 0}</div>
						</div>
					</div>

					<div class="flex items-center gap-3 bg-black/30 rounded-lg p-4">
						<Calendar size={24} class="text-green-400" />
						<div>
							<div class="text-sm text-gray-400">Created</div>
							<div class="text-lg font-semibold">
								{#if game.createdAt}
									{(() => {
										console.log('Raw createdAt value:', game.createdAt, 'Type:', typeof game.createdAt);
										// The timestamp might be in nanoseconds or microseconds, let's try different divisions
										const timestamp = typeof game.createdAt === 'string' ? parseInt(game.createdAt) : game.createdAt;
										if (isNaN(timestamp)) return 'Unknown';
										
										// Try different timestamp formats
										const formats = [
											timestamp,           // milliseconds
											timestamp / 1000,    // seconds
											timestamp / 1000000, // microseconds
											timestamp / 1000000000 // nanoseconds
										];
										
										for (const ts of formats) {
											const date = new Date(ts);
											if (date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
												return date.toLocaleDateString();
											}
										}
										
										return `Debug: ${timestamp}`;
									})()}
								{:else}
									Unknown
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Chart Section (if game is active) -->
			{#if game.status === 'ACTIVE' || game.status === 'Active'}
				{@const allCryptoIds = portfolios.flatMap(p => p.holdings.map(h => h.symbol)).filter((v, i, a) => a.indexOf(v) === i)}
				<div class="bg-gray-900 rounded-lg p-6 mb-8 border border-green-500/20">
					<h2 class="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
						<TrendingUp size={24} />
						Live Competition
					</h2>
					{#if allCryptoIds.length > 0}
						<TournamentChart cryptoIds={allCryptoIds} />
					{:else}
						<div class="text-center py-8">
							<p class="text-gray-400">Waiting for players to submit portfolios...</p>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Winners Display (only for completed games) -->
			{#if game.status === 'COMPLETED' || game.status === 'Completed'}
				<GameWinnersDisplay {game} />
			{/if}

			<!-- Players Section -->
			<div class="bg-gray-900 rounded-lg p-6 mb-8 border border-green-500/20">
				<h2 class="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
					<Users size={24} />
					Players ({game.playerCount || 0})
				</h2>
				
				{#if portfolios.length > 0}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{#each portfolios as portfolio, index}
							<div class="bg-black/30 rounded-lg p-3 flex items-center gap-3">
								<div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-black font-bold">
									{index + 1}
								</div>
							<div class="truncate text-xs">{portfolio.playerAccount}</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8 text-gray-400">
						No players yet. Be the first to join!
					</div>
				{/if}
			</div>

			<!-- Portfolios Section -->
			{#if portfolios.length > 0}
				<div class="bg-gray-900 rounded-lg p-6 border border-green-500/20">
					<h2 class="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
						<DollarSign size={24} />
						Portfolios ({portfolios.length})
					</h2>
					
					<div class="space-y-4">
						{#each portfolios as portfolio, index}
							<div class="bg-black/30 rounded-lg p-4">
								<div class="flex items-center justify-between mb-3">
									<div class="flex items-center gap-3">
										<div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-black font-bold text-sm">
											{index + 1}
										</div>
										<div class="font-semibold">{portfolio.playerAccount}</div>
									</div>
									<div class="text-green-400 font-semibold">
										Status: {portfolio.status}
									</div>
								</div>
								
								{#if portfolio.holdings && portfolio.holdings.length > 0}
									<div class="flex flex-wrap gap-2">
										{#each portfolio.holdings as holding}
											<span class="bg-green-600/20 text-green-400 px-2 py-1 rounded text-sm">
												{holding.symbol} ({holding.allocationPercent}%)
											</span>
										{/each}
									</div>
								{:else}
									<div class="text-gray-400 text-sm">No cryptocurrencies selected</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Portfolio Selection Modal -->
{#if showPortfolioModal}
	<div 
		class="fixed inset-0 bg-black/70 flex items-start justify-center z-50 overflow-y-auto"
		onclick={(e) => { if (e.target === e.currentTarget) { showPortfolioModal = false; portfolioCryptos = []; } }}
	>
		<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-[#39ff14]/30 max-w-md w-full my-8">
			<h2 class="text-2xl font-bold text-white mb-6">Select Your Portfolio</h2>
			
			<div class="space-y-4 mb-6">
				<p class="text-gray-300 text-sm">
					Choose exactly 5 cryptocurrencies for this game. Your portfolio performance will determine your ranking!
				</p>
				
				<div>
					<label class="block text-sm font-medium text-gray-300 mb-3">
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