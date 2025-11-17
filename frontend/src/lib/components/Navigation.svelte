<script lang="ts">
	import { page } from '$app/state';
	import { Home, Trophy, Zap, User, Info, Menu, Settings, LogOut, DollarSign } from '@lucide/svelte';
	
	let mobileMenuOpen = $state(false);
	let userMenuOpen = $state(false);
	
	// Close dropdowns when clicking outside
	function handleClickOutside() {
		userMenuOpen = false;
		mobileMenuOpen = false;
	}
	
	type MenuItem = {
		name: string;
		href: string;
		icon: typeof Home;
		color: string;
	};

	const navigationItems: MenuItem[] = [
		{ name: 'Home', href: '/', icon: Home, color: 'text-primary-green' },
		{ name: 'Tournaments', href: '/tournaments', icon: Trophy, color: 'text-primary-green' },
		{ name: 'Quick Match', href: '/quick-match', icon: Zap, color: 'text-primary-green' },
		{ name: 'About', href: '/about', icon: Info, color: 'text-primary-green' }
	];
</script>

<nav class="bg-bg-dark/95 backdrop-blur-sm border-b border-border-color sticky top-0 z-50">
	<!-- Click outside handler -->
	<div 
		class="fixed inset-0 z-40 {userMenuOpen || mobileMenuOpen ? 'block' : 'hidden'}" 
		onclick={handleClickOutside}
	></div>
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
				<!-- Balance Display -->
				<div class="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-bg-card rounded-lg border border-border-color">
					<DollarSign class="w-4 h-4 text-primary-green" />
					<span class="text-xs text-text-secondary">Balance</span>
					<span class="text-sm font-mono text-primary-green">$493.00</span>
				</div>

				<!-- User Menu -->
				<div class="relative">
					<button 
						onclick={() => userMenuOpen = !userMenuOpen}
						class="flex items-center space-x-2 p-2 rounded-lg hover:bg-bg-accent transition-colors"
					>
						<div class="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center">
							<User class="w-4 h-4 text-black" />
						</div>
						<span class="hidden sm:block text-text-primary text-sm">Player</span>
					</button>

					{#if userMenuOpen}
						<div class="absolute right-0 mt-2 w-48 bg-bg-card border border-border-color rounded-lg shadow-lg py-2 z-50">
							<a href="/profile" class="flex items-center space-x-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-accent">
								<User class="w-4 h-4 text-primary-green" />
								<span>Profile</span>
							</a>
							<a href="/settings" class="flex items-center space-x-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-accent">
								<Settings class="w-4 h-4 text-primary-green" />
								<span>Settings</span>
							</a>
							<div class="border-t border-border-color my-2"></div>
							<button class="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-accent">
								<LogOut class="w-4 h-4 text-primary-green" />
								<span>Sign Out</span>
							</button>
						</div>
					{/if}
				</div>

				<!-- Mobile menu button -->
				<button 
					onclick={() => mobileMenuOpen = !mobileMenuOpen}
					class="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-accent"
					aria-label="Toggle mobile menu"
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
					
					<!-- Mobile Profile Link -->
					<a 
						href="/profile"
						class="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors
							{page.url.pathname === '/profile' 
								? 'text-primary-green bg-primary-green/10 border border-primary-green/20' 
								: 'text-text-secondary hover:text-text-primary hover:bg-bg-accent'}"
						onclick={() => mobileMenuOpen = false}
					>
						<User class="w-5 h-5 text-primary-green" />
						<span>Profile</span>
					</a>
				</div>
			</div>
		{/if}
	</div>
</nav>