<script lang="ts">
	import { page } from '$app/state';
	import { House, Trophy, Zap, User, Menu, TrendingUp, LogOut } from '@lucide/svelte';
	import WalletConnectModal from './WalletConnectModal.svelte';
	import { wallet } from '$lib/stores/wallet';
	import { showToast } from '$lib/stores/toasts';
	
	let mobileMenuOpen = $state(false);
	let walletModalOpen = $state(false);
	let userMenuOpen = $state(false);
	
	const walletState = $derived($wallet);
	
	// Close dropdowns when clicking outside
	function handleClickOutside() {
		mobileMenuOpen = false;
	}
	
	function handleDisconnect() {
		wallet.disconnect();
		showToast('Wallet disconnected', 'info');
	}
	
	// Truncate chain ID for display
	function truncateChainId(chainId: string): string {
		if (chainId.length <= 12) return chainId;
		return `${chainId.slice(0, 6)}...${chainId.slice(-4)}`;
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
		{ name: 'Leaderboard', href: '/leaderboard', icon: TrendingUp, color: 'text-primary-green' }
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
				<!-- Profile and Wallet -->
				<div class="hidden md:flex items-center space-x-3">
					{#if walletState.isConnected}
						<!-- Profile Link -->
						<a 
							href="/profile" 
							class="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
								{page.url.pathname === '/profile' 
									? 'text-primary-green bg-primary-green/10 border border-primary-green/30' 
									: 'text-text-secondary hover:text-text-primary hover:bg-bg-accent'}"
						>
							<User class="w-4 h-4" />
							<span>Profile</span>
						</a>
						
						<!-- Wallet Display -->
						<div class="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-green/10 border border-primary-green/20">
							<div class="w-2 h-2 rounded-full bg-primary-green animate-pulse"></div>
							<span class="text-sm font-mono text-primary-green">
								{truncateChainId(walletState.chainId || '')}
							</span>
							<button
								onclick={handleDisconnect}
								class="p-1.5 rounded hover:bg-primary-green/20 text-primary-green ml-2"
								aria-label="Disconnect wallet"
							>
								<LogOut class="w-4 h-4" />
							</button>
						</div>
					{:else}
						<!-- Connect Wallet Button -->
						<button
							onclick={() => walletModalOpen = true}
							class="px-4 py-2 rounded-lg bg-primary-green text-black font-medium hover:bg-primary-green/90 transition-colors"
						>
							Connect Wallet
						</button>
					{/if}
				</div>
				
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
					
					{#if walletState.isConnected}
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
						
						<!-- Mobile Wallet Display -->
						<div class="flex items-center justify-between px-4 py-3 rounded-lg bg-primary-green/10 border border-primary-green/20">
							<div class="flex items-center space-x-2">
								<div class="w-2 h-2 rounded-full bg-primary-green animate-pulse"></div>
								<span class="text-sm font-mono text-primary-green">
									{truncateChainId(walletState.chainId || '')}
								</span>
							</div>
							<button
								onclick={handleDisconnect}
								class="p-1.5 rounded hover:bg-primary-green/20 text-primary-green"
								aria-label="Disconnect wallet"
							>
								<LogOut class="w-4 h-4" />
							</button>
						</div>
					{:else}
						<!-- Mobile Connect Wallet Button -->
						<button
							onclick={() => walletModalOpen = true}
							class="w-full px-4 py-3 rounded-lg bg-primary-green text-black font-medium hover:bg-primary-green/90 transition-colors"
						>
							Connect Wallet
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</nav>

<!-- Wallet Connect Modal -->
<WalletConnectModal bind:isOpen={walletModalOpen} onClose={() => walletModalOpen = false} />