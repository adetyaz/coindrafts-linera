<script lang="ts">
	let currentView = $state<'home' | 'dashboard' | 'portfolio'>('home');
	let portfolioMode = $state<'game' | 'tournament'>('game');
	let selectedGameId = $state('');
	let selectedTournamentId = $state('');

	function showDashboard() {
		currentView = 'dashboard';
	}

	function showPortfolio(mode: 'game' | 'tournament', id: string = '') {
		currentView = 'portfolio';
		portfolioMode = mode;
		if (mode === 'game') {
			selectedGameId = id;
		} else {
			selectedTournamentId = id;
		}
	}

	function showHome() {
		currentView = 'home';
	}
</script>

<nav class="bg-gray-800 text-white p-4 mb-6">
	<div class="container mx-auto flex justify-between items-center">
		<h1 class="text-2xl font-bold">CoinDrafts</h1>
		<div class="space-x-4">
			<button 
				onclick={showHome}
				class="hover:bg-gray-700 px-3 py-2 rounded {currentView === 'home' ? 'bg-gray-700' : ''}"
			>
				Home
			</button>
			<button 
				onclick={showDashboard}
				class="hover:bg-gray-700 px-3 py-2 rounded {currentView === 'dashboard' ? 'bg-gray-700' : ''}"
			>
				Dashboard
			</button>
			<button 
				onclick={() => showPortfolio('game')}
				class="hover:bg-gray-700 px-3 py-2 rounded {currentView === 'portfolio' ? 'bg-gray-700' : ''}"
			>
				Portfolio
			</button>
		</div>
	</div>
</nav>

{#if currentView === 'home'}
	<main class="container mx-auto p-6">
		<div class="text-center mb-12">
			<h1 class="text-5xl font-bold mb-4">Welcome to CoinDrafts</h1>
			<p class="text-xl text-gray-600 mb-8">
				Compete in cryptocurrency portfolio contests and tournaments on the Linera blockchain
			</p>
		</div>

		<div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
			<div class="bg-white shadow-lg rounded-lg p-8 border">
				<h2 class="text-2xl font-semibold mb-4">Quick Games</h2>
				<p class="text-gray-600 mb-6">
					Join fast-paced portfolio contests. Pick your top 5 cryptocurrencies 
					and compete against other players in real-time.
				</p>
				<ul class="text-sm text-gray-600 mb-6 space-y-2">
					<li>• Select up to 5 cryptocurrencies</li>
					<li>• Real-time price tracking</li>
					<li>• Instant results</li>
					<li>• Multiple game modes</li>
				</ul>
				<button 
					onclick={showDashboard}
					class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded w-full"
				>
					View Active Games
				</button>
			</div>

			<div class="bg-white shadow-lg rounded-lg p-8 border">
				<h2 class="text-2xl font-semibold mb-4">Tournaments</h2>
				<p class="text-gray-600 mb-6">
					Enter structured tournaments with multiple rounds. Build larger portfolios 
					and compete for bigger prizes over extended periods.
				</p>
				<ul class="text-sm text-gray-600 mb-6 space-y-2">
					<li>• Select up to 10 cryptocurrencies</li>
					<li>• Multi-round competition</li>
					<li>• Entry fees and prize pools</li>
					<li>• Various tournament formats</li>
				</ul>
				<button 
					onclick={showDashboard}
					class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded w-full"
				>
					Browse Tournaments
				</button>
			</div>
		</div>

		<div class="text-center mt-12">
			<h2 class="text-2xl font-semibold mb-4">How It Works</h2>
			<div class="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
				<div class="text-center">
					<div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
						<span class="text-blue-600 font-bold text-xl">1</span>
					</div>
					<h3 class="font-semibold mb-2">Choose Your Portfolio</h3>
					<p class="text-sm text-gray-600">Select cryptocurrencies you think will perform best</p>
				</div>
				<div class="text-center">
					<div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
						<span class="text-green-600 font-bold text-xl">2</span>
					</div>
					<h3 class="font-semibold mb-2">Submit Entry</h3>
					<p class="text-sm text-gray-600">Lock in your choices before the competition starts</p>
				</div>
				<div class="text-center">
					<div class="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
						<span class="text-yellow-600 font-bold text-xl">3</span>
					</div>
					<h3 class="font-semibold mb-2">Track Performance</h3>
					<p class="text-sm text-gray-600">Watch real-time price movements and rankings</p>
				</div>
				<div class="text-center">
					<div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
						<span class="text-purple-600 font-bold text-xl">4</span>
					</div>
					<h3 class="font-semibold mb-2">Win Prizes</h3>
					<p class="text-sm text-gray-600">Earn rewards based on portfolio performance</p>
				</div>
			</div>
		</div>

		<div class="text-center mt-12">
			<p class="text-gray-600 mb-6">
				Powered by <strong>Linera Protocol</strong> - Fast, secure, and decentralized
			</p>
			<button 
				onclick={showDashboard}
				class="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
			>
				Get Started
			</button>
		</div>
	</main>
{:else if currentView === 'dashboard'}
	{#await import('./dashboard.svelte') then { default: Dashboard }}
		<Dashboard />
	{/await}
{:else if currentView === 'portfolio'}
	{#await import('./portfolio.svelte') then { default: Portfolio }}
		<Portfolio 
			gameId={selectedGameId} 
			tournamentId={selectedTournamentId} 
			mode={portfolioMode} 
		/>
	{/await}
{/if}
