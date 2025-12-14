<script lang="ts">
	import { page } from '$app/state';
	import { House, Trophy, Zap, TrendingUp, Menu, User } from '@lucide/svelte';
	import '$lib/appkit'; // Ensure AppKit is initialized
	
	let mobileMenuOpen = $state(false);
	
	// Close dropdowns when clicking outside
	function handleClickOutside() {
		mobileMenuOpen = false;
	}
	
	type MenuItem = {
		name: string;
		href: string;
		icon: typeof House;
		color: string;
	};

	const navigationItems: MenuItem[] = [
		{ name: 'Home', href: '/', icon: House, color: 'text-primary-green' },
		{ name: 'Tournaments', href: '/tournaments', icon: Trophy, color: 'text-primary-green' },
		{ name: 'Quick Match', href: '/quick-match', icon: Zap, color: 'text-primary-green' },
		{ name: 'Leaderboard', href: '/leaderboard', icon: TrendingUp, color: 'text-primary-green' },
		{ name: 'Profile', href: '/profile', icon: User, color: 'text-primary-green' }
	];
</script>

<nav class="bg-bg-dark/95 backdrop-blur-sm border-b border-border-color sticky top-0 z-50">
	<!-- Click outside handler -->
	{#if mobileMenuOpen}
		<button
			type="button"
			class="fixed inset-0 z-40 bg-transparent cursor-default"
			onclick={handleClickOutside}
			aria-label="Close menu"
		></button>
	{/if}
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Logo -->
			<div class="flex items-center">
				<a href="/" class="flex items-center space-x-3">
					<span class="text-xl font-bold text-primary-green font-mono">CoinDrafts</span>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center space-x-1">
				{#each navigationItems as item}
					{@const IconComponent = item.icon}
					<a 
						href={item.href}
						class="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
							{page.url.pathname === item.href 
								? 'text-primary-green bg-primary-green/10 border border-primary-green/30' 
								: 'text-text-secondary hover:text-text-primary hover:bg-bg-accent'}"
					>
						<IconComponent class="w-4 h-4 {item.color}" />
						<span>{item.name}</span>
					</a>
				{/each}
			</div>

			<!-- Right Side Actions -->
			<div class="flex items-center space-x-4">
				<!-- AppKit Wallet Button -->
				<appkit-button />
				
				<!-- Mobile Menu Button -->
				<button
					onclick={() => mobileMenuOpen = !mobileMenuOpen}
					class="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-accent"
					aria-label="Toggle menu"
				>
					<Menu class="w-6 h-6" />
				</button>
			</div>
		</div>
		
		<!-- Mobile Navigation -->
		{#if mobileMenuOpen}
			<div class="md:hidden border-t border-border-color bg-bg-dark/95 relative z-50">
				<div class="px-4 py-4 space-y-1">
					{#each navigationItems as item}
						{@const IconComponent = item.icon}
						<a 
							href={item.href}
							class="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors
								{page.url.pathname === item.href 
									? 'text-primary-green bg-primary-green/10 border border-primary-green/20' 
									: 'text-text-secondary hover:text-text-primary hover:bg-bg-accent'}"
							onclick={() => mobileMenuOpen = false}
						>
							<IconComponent class="w-5 h-5 {item.color}" />
							<span>{item.name}</span>
						</a>
					{/each}
					
					<!-- Mobile AppKit Button -->
					<div class="pt-2">
						<appkit-button />
					</div>
				</div>
			</div>
		{/if}
	</div>
</nav>