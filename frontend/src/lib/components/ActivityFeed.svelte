<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { 
		Activity, 
		UserPlus, 
		FileText, 
		Play, 
		Trophy, 
		ChevronRight,
		ChevronDown
	} from '@lucide/svelte';
	import { 
		type ActivityEvent, 
		formatRelativeTime, 
		truncateAccount 
	} from '$lib/services/activityService';

	interface Props {
		events: ActivityEvent[];
		autoRefresh?: boolean;
		refreshInterval?: number;
		onRefresh?: () => Promise<void>;
	}

	let { 
		events = $bindable([]), 
		autoRefresh = false,
		refreshInterval = 15000,
		onRefresh
	}: Props = $props();

	let isCollapsed = $state(false);
	let isRefreshing = $state(false);
	let lastUpdate = $state<Date>(new Date());
	let refreshTimer: number | null = null;

	onMount(() => {
		if (autoRefresh && onRefresh) {
			setupAutoRefresh();
		}
	});

	onDestroy(() => {
		if (refreshTimer) {
			clearInterval(refreshTimer);
		}
	});

	function setupAutoRefresh() {
		if (!onRefresh) return;

		refreshTimer = window.setInterval(async () => {
			await handleRefresh();
		}, refreshInterval);
	}

	async function handleRefresh() {
		if (!onRefresh || isRefreshing) return;

		try {
			isRefreshing = true;
			await onRefresh();
			lastUpdate = new Date();
		} catch (err) {
			console.error('Failed to refresh activity:', err);
		} finally {
			isRefreshing = false;
		}
	}

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}

	function getEventIcon(type: string) {
		switch (type) {
			case 'PLAYER_JOINED': return UserPlus;
			case 'PORTFOLIO_SUBMITTED': return FileText;
			case 'GAME_STARTED':
			case 'TOURNAMENT_STARTED': return Play;
			case 'GAME_ENDED':
			case 'TOURNAMENT_ENDED': return Trophy;
			case 'TOURNAMENT_CREATED': return Activity;
			default: return Activity;
		}
	}

	function getEventColor(type: string): string {
		switch (type) {
			case 'PLAYER_JOINED': return 'text-blue-400';
			case 'PORTFOLIO_SUBMITTED': return 'text-purple-400';
			case 'GAME_STARTED':
			case 'TOURNAMENT_STARTED': return 'text-green-400';
			case 'GAME_ENDED':
			case 'TOURNAMENT_ENDED': return 'text-yellow-400';
			case 'TOURNAMENT_CREATED': return 'text-cyan-400';
			default: return 'text-gray-400';
		}
	}
</script>

<div class="bg-gray-900 rounded-lg border border-green-500/20 overflow-hidden">
	<!-- Header -->
	<button
		type="button"
		onclick={toggleCollapse}
		class="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
	>
		<div class="flex items-center gap-2">
			<Activity size={20} class="text-green-400" />
			<h3 class="text-lg font-semibold text-green-400">Activity Feed</h3>
			{#if events.length > 0}
				<span class="bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full text-xs font-medium">
					{events.length}
				</span>
			{/if}
		</div>
		
		<div class="flex items-center gap-2">
			{#if autoRefresh && !isCollapsed}
				<span class="text-xs text-gray-400">
					{isRefreshing ? 'Updating...' : `Updated ${formatRelativeTime(lastUpdate)}`}
				</span>
			{/if}
			{#if isCollapsed}
				<ChevronRight size={20} class="text-gray-400" />
			{:else}
				<ChevronDown size={20} class="text-gray-400" />
			{/if}
		</div>
	</button>

	<!-- Activity List -->
	{#if !isCollapsed}
		<div class="border-t border-gray-800">
			{#if events.length === 0}
				<div class="p-6 text-center text-gray-400">
					<Activity size={32} class="mx-auto mb-2 opacity-50" />
					<p>No activity yet</p>
				</div>
			{:else}
				<div class="max-h-96 overflow-y-auto">
					{#each events as event (event.id)}
						<div class="flex items-start gap-3 p-4 hover:bg-gray-800/30 transition-colors border-b border-gray-800/50 last:border-b-0">
							<!-- Icon -->
							<div class="flex-shrink-0 mt-1">
								<svelte:component this={getEventIcon(event.type)} size={18} class={getEventColor(event.type)} />
							</div>

							<!-- Content -->
							<div class="flex-1 min-w-0">
								<p class="text-sm text-gray-200">
									{event.description}
								</p>
								{#if event.playerAccount}
									<p class="text-xs text-gray-400 mt-1">
										{truncateAccount(event.playerAccount)}
									</p>
								{/if}
								<p class="text-xs text-gray-500 mt-1">
									{formatRelativeTime(event.timestamp)}
								</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Custom scrollbar for activity list */
	.overflow-y-auto {
		scrollbar-width: thin;
		scrollbar-color: rgba(34, 197, 94, 0.3) rgba(0, 0, 0, 0.3);
	}

	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}

	.overflow-y-auto::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 3px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: rgba(34, 197, 94, 0.3);
		border-radius: 3px;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background: rgba(34, 197, 94, 0.5);
	}
</style>
