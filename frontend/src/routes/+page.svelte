<script lang="ts">
	import { onMount } from 'svelte';
	import { coinDraftsService } from '$lib/coinDraftsService';
	import type { Tournament, Game } from '$lib/coinDraftsService';
	import { Gamepad2, Zap, Trophy, Target, Flame } from '@lucide/svelte';

	let tournaments: Tournament[] = $state([]);
	let activeGames: Game[] = $state([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			// Load initial data
			const [tournamentsData, gamesData] = await Promise.all([
				coinDraftsService.fetchTournaments(),
				coinDraftsService.fetchGames()
			]);
			
			tournaments = tournamentsData.slice(0, 4); // Show only 4 featured tournaments
			activeGames = gamesData.slice(0, 6); // Show only 6 active games
		} catch (error) {
			console.error('Error loading homepage data:', error);
		} finally {
			loading = false;
		}
	});
</script>

<div class="container mx-auto px-4 py-8">
	<!-- Hero Section -->
	<section class="relative py-20 px-4 overflow-hidden">
		<!-- Background Effects -->
		<div class="absolute inset-0 bg-linear-to-br from-primary-green/20 via-transparent to-light-green/20"></div>
		<div class="absolute top-10 left-10 w-32 h-32 bg-primary-green/10 rounded-full blur-3xl"></div>
		<div class="absolute bottom-10 right-10 w-40 h-40 bg-light-green/10 rounded-full blur-3xl"></div>
		
		<div class="relative max-w-6xl mx-auto text-center">
			<h1 class="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
				Welcome to <span class="text-transparent bg-clip-text bg-green-gradient font-mono">CoinDrafts</span>
			</h1>
			<p class="text-xl md:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
				The world's first real-time cryptocurrency fantasy gaming platform built on Linera's revolutionary microchain architecture
			</p>
			
			<!-- CTA Buttons -->
			<div class="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
				<a href="/tournaments" class="btn-primary text-lg px-8 py-4 animate-slide-up flex items-center gap-2">
					<Trophy class="w-5 h-5" />
					Browse Tournaments
				</a>
				<a href="/quick-match" class="btn-secondary text-lg px-8 py-4 animate-slide-up flex items-center gap-2">
					<Zap class="w-5 h-5" />
					Quick Match
				</a>
			</div>

			<!-- Stats Row -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
				<div class="text-center">
					<div class="text-3xl font-bold text-primary-green font-mono">$2.5M+</div>
					<div class="text-sm text-text-secondary">Total Volume</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-primary-green font-mono">15K+</div>
					<div class="text-sm text-text-secondary">Active Players</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-primary-green font-mono">500+</div>
					<div class="text-sm text-text-secondary">Tournaments</div>
				</div>
				<div class="text-center">
					<div class="text-3xl font-bold text-primary-green font-mono">24/7</div>
					<div class="text-sm text-text-secondary">Live Games</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Featured Tournaments Section -->
	<section class="py-16 px-4">
		<div class="max-w-6xl mx-auto">
			<div class="text-center mb-12">
				<h2 class="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
					<Flame class="w-10 h-10 text-primary-green" />
					Featured Tournaments
				</h2>
				<p class="text-text-secondary text-lg">Join live tournaments and compete for crypto rewards</p>
			</div>
			
			{#if loading}
				<div class="text-center py-12">
					<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
					<p class="text-text-secondary mt-4">Loading tournaments...</p>
				</div>
			{:else if tournaments.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{#each tournaments as tournament}
						<div class="card-dark p-6 hover:border-primary-green/50 transition-all duration-300 hover:transform hover:scale-105 group">
							<!-- Tournament Header -->
							<div class="flex justify-between items-start mb-4">
								<h3 class="text-lg font-semibold text-white group-hover:text-primary-green transition-colors">
									{tournament.name}
								</h3>
								<span class="text-xs px-2 py-1 rounded-full font-medium
									{tournament.status === 'Active' 
										? 'bg-primary-green/20 text-primary-green border border-primary-green/30'
										: 'bg-primary-green/10 text-text-secondary border border-border-color'}">
									{tournament.status}
								</span>
							</div>

							<!-- Tournament Details -->
							<div class="space-y-3 mb-6">
								<div class="flex justify-between items-center">
									<span class="text-text-secondary text-sm">Entry Fee</span>
									<span class="text-primary-green font-mono font-medium">${tournament.entryFeeUsdc}</span>
								</div>
								<div class="flex justify-between items-center">
									<span class="text-text-secondary text-sm">Players</span>
									<span class="text-white font-medium">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
								</div>
								<div class="flex justify-between items-center">
									<span class="text-text-secondary text-sm">Type</span>
									<span class="text-white text-sm bg-bg-accent px-2 py-1 rounded">{tournament.tournamentType}</span>
								</div>
								<!-- Progress Bar -->
								<div class="mt-4">
									<div class="flex justify-between text-xs text-text-secondary mb-1">
										<span>Fill Rate</span>
										<span>{Math.round((tournament.currentParticipants / tournament.maxParticipants) * 100)}%</span>
									</div>
									<div class="w-full bg-bg-accent rounded-full h-2">
										<div 
											class="bg-primary-green h-2 rounded-full transition-all duration-500"
											style="width: {(tournament.currentParticipants / tournament.maxParticipants) * 100}%"
										></div>
									</div>
								</div>
							</div>

							<!-- Join Button -->
							<a 
								href="/tournaments/{tournament.id}" 
								class="block w-full btn-primary text-center group-hover:shadow-lg group-hover:shadow-primary-green/25"
							>
								Join Tournament
							</a>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<div class="flex justify-center mb-4">
						<Gamepad2 class="w-24 h-24 text-primary-green" />
					</div>
					<h3 class="text-xl font-semibold text-white mb-2">No tournaments yet</h3>
					<p class="text-text-secondary mb-6">Be the first to create an exciting tournament!</p>
					<a href="/tournaments" class="btn-primary flex items-center gap-2 mx-auto w-fit">
						<Trophy class="w-5 h-5" />
						Create Tournament
					</a>
				</div>
			{/if}
		
		<div class="text-center mt-8">
			<a href="/tournaments" class="text-primary-green hover:text-light-green font-medium">
				View All Tournaments →
			</a>
		</div>
	</section>

	<!-- Game Modes Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
			<Gamepad2 class="w-10 h-10 text-primary-green" />
			Game Modes
		</h2>
		<div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30 text-center">
				<div class="flex justify-center mb-4">
					<Zap class="w-12 h-12 text-primary-green" />
				</div>
				<h3 class="text-xl font-semibold text-white mb-4">Quick Match</h3>
				<p class="text-text-secondary mb-6 text-sm leading-relaxed">
					Fast-paced 24-hour games. Pick your top cryptocurrencies and compete for instant rewards.
				</p>
				<ul class="text-xs text-text-secondary mb-6 space-y-1">
					<li>• 24-hour duration</li>
					<li>• Up to 5 cryptocurrencies</li>
					<li>• Instant results</li>
					<li>• Low entry fees</li>
				</ul>
				<a href="/quick-match" class="bg-primary-green hover:bg-dark-green text-black font-medium py-2 px-6 rounded-full transition-colors cursor-pointer">
					Play Now
				</a>
			</div>

			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30 text-center">
				<div class="flex justify-center mb-4">
					<Trophy class="w-12 h-12 text-primary-green" />
				</div>
				<h3 class="text-xl font-semibold text-white mb-4">Traditional Leagues</h3>
				<p class="text-text-secondary mb-6 text-sm leading-relaxed">
					Multi-round tournaments with elimination brackets. Bigger portfolios, bigger prizes.
				</p>
				<ul class="text-xs text-text-secondary mb-6 space-y-1">
					<li>• Multi-round format</li>
					<li>• Up to 10 cryptocurrencies</li>
					<li>• Tournament brackets</li>
					<li>• Prize pools</li>
				</ul>
				<a href="/tournaments" class="bg-primary-green hover:bg-dark-green text-black font-medium py-2 px-6 rounded-full transition-colors cursor-pointer">
					Join League
				</a>
			</div>

			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30 text-center">
				<div class="flex justify-center mb-4">
					<Target class="w-12 h-12 text-primary-green" />
				</div>
				<h3 class="text-xl font-semibold text-white mb-4">Price Prediction</h3>
				<p class="text-text-secondary mb-6 text-sm leading-relaxed">
					Predict exact price movements and multipliers. Test your market knowledge.
				</p>
				<ul class="text-xs text-text-secondary mb-6 space-y-1">
					<li>• Price forecasting</li>
					<li>• Multiplier betting</li>
					<li>• Technical analysis</li>
					<li>• Expert leaderboards</li>
				</ul>
				<button class="bg-primary-green/50 text-primary-green font-medium py-2 px-6 rounded-full cursor-not-allowed">
					Coming Soon
				</button>
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold text-white mb-12 text-center">How CoinDrafts Works</h2>
		<div class="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
			<div class="text-center">
				<div class="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-black font-bold text-xl">1</span>
				</div>
				<h3 class="font-semibold text-white mb-2">Choose Portfolio</h3>
				<p class="text-sm text-text-secondary">Select cryptocurrencies you believe will outperform the market</p>
			</div>
			<div class="text-center">
				<div class="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-black font-bold text-xl">2</span>
				</div>
				<h3 class="font-semibold text-white mb-2">Lock In Entry</h3>
				<p class="text-sm text-text-secondary">Submit your portfolio before the competition period begins</p>
			</div>
			<div class="text-center">
				<div class="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-black font-bold text-xl">3</span>
				</div>
				<h3 class="font-semibold text-white mb-2">Track Real-Time</h3>
				<p class="text-sm text-text-secondary">Monitor live price movements and your ranking position</p>
			</div>
			<div class="text-center">
				<div class="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
					<span class="text-black font-bold text-xl">4</span>
				</div>
				<h3 class="font-semibold text-white mb-2">Win Rewards</h3>
				<p class="text-sm text-text-secondary">Earn prizes based on your portfolio's performance ranking</p>
			</div>
		</div>
	</section>

	<!-- Footer CTA -->
	<section class="text-center py-12">
		<h2 class="text-2xl font-bold text-white mb-4">Ready to Start Competing?</h2>
		<p class="text-text-secondary mb-8 max-w-2xl mx-auto">
			Join thousands of crypto enthusiasts competing in real-time portfolio contests powered by Linera's lightning-fast microchain technology.
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a 
				href="/tournaments" 
				class="btn-primary font-bold py-3 px-8 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto w-fit"
			>
				<Trophy class="w-5 h-5" />
				Join Tournament
			</a>
			<a 
				href="/about" 
				class="border border-white/30 text-white hover:bg-white/10 font-medium py-3 px-8 rounded-full transition-all duration-200 cursor-pointer"
			>
				Learn More
			</a>
		</div>
	</section>
</div>
