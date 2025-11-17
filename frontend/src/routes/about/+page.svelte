<script lang="ts">
	import { Gamepad2, Target, Zap, Trophy, Settings } from '@lucide/svelte';
</script>

<svelte:head>
	<title>About - CoinDrafts</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Hero Section -->
	<section class="text-center mb-16 py-12">
		<h1 class="text-5xl font-bold text-white mb-6">About CoinDrafts</h1>
		<p class="text-xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
			The world's first real-time cryptocurrency fantasy gaming platform built on Linera's revolutionary microchain architecture
		</p>
	</section>

	<!-- What is CoinDrafts -->
	<section class="mb-16">
		<div class="max-w-4xl mx-auto">
			<h2 class="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
				<Gamepad2 class="w-10 h-10 text-primary-green" />
				What is CoinDrafts?
			</h2>
			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30">
				<p class="text-text-secondary text-lg leading-relaxed mb-6">
					CoinDrafts is a next-generation fantasy gaming platform where players compete by creating cryptocurrency portfolios and predicting market movements. Unlike traditional fantasy sports, CoinDrafts uses real-time cryptocurrency price data to determine winners, creating an exciting and dynamic gaming experience.
				</p>
				<p class="text-text-secondary text-lg leading-relaxed">
					Built on the Linera blockchain, CoinDrafts leverages microchain technology to provide sub-second portfolio updates, unlimited scalability, and professional-grade AI integration impossible on traditional blockchains.
				</p>
			</div>
		</div>
	</section>

	<!-- Game Modes -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
			<Target class="w-10 h-10 text-primary-green" />
			Game Modes
		</h2>
		<div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30">
				<div class="flex justify-center mb-4">
					<Zap class="w-10 h-10 text-primary-green" />
				</div>
				<h3 class="text-xl font-semibold text-white mb-4 text-center">Quick Match</h3>
				<ul class="text-text-secondary space-y-2 text-sm">
					<li>• <strong>Duration:</strong> 24 hours</li>
					<li>• <strong>Portfolio Size:</strong> Up to 5 cryptocurrencies</li>
					<li>• <strong>Entry Fee:</strong> $1 - $50</li>
					<li>• <strong>Players:</strong> 2-20 per game</li>
					<li>• <strong>Winner:</strong> Highest portfolio % gain</li>
				</ul>
			</div>

			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30">
				<div class="flex justify-center mb-4">
					<Trophy class="w-10 h-10 text-primary-green" />
				</div>
				<h3 class="text-xl font-semibold text-white mb-4 text-center">Traditional Leagues</h3>
				<ul class="text-text-secondary space-y-2 text-sm">
					<li>• <strong>Duration:</strong> Multi-round tournaments</li>
					<li>• <strong>Portfolio Size:</strong> Up to 10 cryptocurrencies</li>
					<li>• <strong>Entry Fee:</strong> $10 - $500</li>
					<li>• <strong>Players:</strong> 8-64 per tournament</li>
					<li>• <strong>Format:</strong> Elimination brackets</li>
				</ul>
			</div>

			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30">
				<div class="flex justify-center mb-4">
					<Target class="w-10 h-10 text-primary-green" />
				</div>
				<h3 class="text-xl font-semibold text-white mb-4 text-center">Price Prediction</h3>
				<ul class="text-text-secondary space-y-2 text-sm">
					<li>• <strong>Duration:</strong> Variable timeframes</li>
					<li>• <strong>Prediction:</strong> Exact price targets</li>
					<li>• <strong>Entry Fee:</strong> $5 - $100</li>
					<li>• <strong>Players:</strong> Unlimited</li>
					<li>• <strong>Status:</strong> <span class="text-primary-green">Coming Soon</span></li>
				</ul>
			</div>
		</div>
	</section>

	<!-- How It Works -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
			<Settings class="w-10 h-10 text-primary-green" />
			How It Works
		</h2>
		<div class="max-w-5xl mx-auto">
			<div class="grid md:grid-cols-2 gap-8 items-center">
				<div class="space-y-6">
					<div class="flex items-start space-x-4">
						<div class="w-8 h-8 rounded-full bg-primary-green flex items-center justify-center shrink-0">
							<span class="text-black font-bold text-sm">1</span>
						</div>
						<div>
							<h3 class="text-lg font-semibold text-white mb-2">Choose Your Portfolio</h3>
							<p class="text-text-secondary text-sm">Select cryptocurrencies you believe will outperform during the competition period. Research market trends and make strategic choices.</p>
						</div>
					</div>

					<div class="flex items-start space-x-4">
						<div class="w-8 h-8 rounded-full bg-primary-green flex items-center justify-center shrink-0">
							<span class="text-black font-bold text-sm">2</span>
						</div>
						<div>
							<h3 class="text-lg font-semibold text-white mb-2">Lock In Your Entry</h3>
							<p class="text-text-secondary text-sm">Submit your portfolio and pay the entry fee before the competition begins. No changes allowed once the game starts.</p>
						</div>
					</div>

					<div class="flex items-start space-x-4">
						<div class="w-8 h-8 rounded-full bg-primary-green flex items-center justify-center shrink-0">
							<span class="text-black font-bold text-sm">3</span>
						</div>
						<div>
							<h3 class="text-lg font-semibold text-white mb-2">Track Real-Time Performance</h3>
							<p class="text-text-secondary text-sm">Monitor live cryptocurrency prices and your portfolio's performance. Watch your ranking change in real-time.</p>
						</div>
					</div>

					<div class="flex items-start space-x-4">
						<div class="w-8 h-8 rounded-full bg-primary-green flex items-center justify-center shrink-0">
							<span class="text-black font-bold text-sm">4</span>
						</div>
						<div>
							<h3 class="text-lg font-semibold text-white mb-2">Win Rewards</h3>
							<p class="text-text-secondary text-sm">Earn prizes based on your portfolio's percentage gains. Top performers receive the largest payouts.</p>
						</div>
					</div>
				</div>

				<div class="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
					<h3 class="text-xl font-semibold text-white mb-4 text-center">Prize Distribution</h3>
					<div class="space-y-3">
						<div class="flex justify-between text-sm">
							<span class="text-text-secondary">1st Place:</span>
							<span class="text-primary-green font-bold">50% of prize pool</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-text-secondary">2nd Place:</span>
							<span class="text-primary-green font-bold">30% of prize pool</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-text-secondary">3rd Place:</span>
							<span class="text-primary-green font-bold">20% of prize pool</span>
						</div>
					</div>
					<div class="mt-4 pt-4 border-t border-white/20">
						<p class="text-xs text-text-secondary text-center">
							Prize pool = Total entry fees minus 10% platform fee
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Why Linera -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
			<Zap class="w-10 h-10 text-primary-green" />
			Powered by Linera
		</h2>
		<div class="max-w-4xl mx-auto">
			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-primary-green/30">
				<p class="text-text-secondary text-lg leading-relaxed mb-6">
					CoinDrafts is built on Linera, a revolutionary blockchain designed for high-performance applications. Linera's microchain architecture provides several key advantages:
				</p>
				<div class="grid md:grid-cols-2 gap-6">
					<div class="space-y-4">
						<div class="flex items-center space-x-3">
							<div class="w-6 h-6 rounded-full bg-primary-green flex items-center justify-center">
								<span class="text-black text-xs">✓</span>
							</div>
							<span class="text-white font-medium">Sub-second transaction finality</span>
						</div>
						<div class="flex items-center space-x-3">
							<div class="w-6 h-6 rounded-full bg-primary-green flex items-center justify-center">
								<span class="text-black text-xs">✓</span>
							</div>
							<span class="text-white font-medium">Unlimited horizontal scaling</span>
						</div>
						<div class="flex items-center space-x-3">
							<div class="w-6 h-6 rounded-full bg-primary-green flex items-center justify-center">
								<span class="text-black text-xs">✓</span>
							</div>
							<span class="text-white font-medium">Real-time portfolio updates</span>
						</div>
					</div>
					<div class="space-y-4">
						<div class="flex items-center space-x-3">
							<div class="w-6 h-6 rounded-full bg-primary-green flex items-center justify-center">
								<span class="text-black text-xs">✓</span>
							</div>
							<span class="text-white font-medium">Cross-chain messaging</span>
						</div>
						<div class="flex items-center space-x-3">
							<div class="w-6 h-6 rounded-full bg-primary-green flex items-center justify-center">
								<span class="text-black text-xs">✓</span>
							</div>
							<span class="text-white font-medium">Professional-grade AI integration</span>
						</div>
						<div class="flex items-center space-x-3">
							<div class="w-6 h-6 rounded-full bg-primary-green flex items-center justify-center">
								<span class="text-black text-xs">✓</span>
							</div>
							<span class="text-white font-medium">Decentralized & secure</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- FAQ -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
			<Settings class="w-8 h-8 text-primary-green" />
			Frequently Asked Questions
		</h2>
		<div class="max-w-4xl mx-auto space-y-6">
			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30">
				<h3 class="text-lg font-semibold text-white mb-3">How do I get started?</h3>
				<p class="text-text-secondary">Simply browse available tournaments or quick matches, select your cryptocurrencies, pay the entry fee, and compete! No complex registration required.</p>
			</div>

			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30">
				<h3 class="text-lg font-semibold text-white mb-3">What cryptocurrencies can I choose from?</h3>
				<p class="text-text-secondary">Currently, you can select from major cryptocurrencies including Bitcoin, Ethereum, and other top-ranked tokens. Our selection is regularly updated based on market conditions.</p>
			</div>

			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30">
				<h3 class="text-lg font-semibold text-white mb-3">How are winners determined?</h3>
				<p class="text-text-secondary">Winners are determined by the percentage gain of their portfolio during the competition period. The player with the highest % gain wins first place.</p>
			</div>

			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30">
				<h3 class="text-lg font-semibold text-white mb-3">When do I receive my winnings?</h3>
				<p class="text-text-secondary">Winnings are distributed automatically within minutes of game completion. All transactions are processed on the Linera blockchain for transparency and security.</p>
			</div>

			<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-primary-green/30">
				<h3 class="text-lg font-semibold text-white mb-3">Is CoinDrafts legal?</h3>
				<p class="text-text-secondary">CoinDrafts operates as a skill-based gaming platform where success depends on cryptocurrency market knowledge and strategy, not chance. Please check your local regulations.</p>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="text-center py-12">
		<h2 class="text-3xl font-bold text-white mb-6">Ready to Compete?</h2>
		<p class="text-text-secondary mb-8 max-w-2xl mx-auto">
			Join the next generation of cryptocurrency gaming. Test your market knowledge against players worldwide.
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a 
				href="/tournaments"
				class="bg-primary-green hover:bg-dark-green text-black font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2"
			>
				<Trophy class="w-5 h-5" />
				Browse Tournaments
			</a>
			<a 
				href="/quick-match" 
				class="bg-primary-green hover:bg-dark-green text-black font-bold py-4 px-8 rounded-full text-lg transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2"
			>
				<Zap class="w-5 h-5" />
				Quick Match
			</a>
		</div>
	</section>
</div>