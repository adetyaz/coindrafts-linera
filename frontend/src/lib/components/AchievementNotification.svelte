<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import type { Achievement } from '$lib/services/profileService';

	export let achievement: Achievement;
	export let onClose: () => void;

	function getAchievementIcon(type: string): string {
		const icons: Record<string, string> = {
			FirstWin: '🏆',
			Play10Games: '🎮',
			Play50Games: '🎯',
			WinStreak3: '🔥',
			PerfectPortfolio: '💎',
			RisingStar: '⭐',
			Legend: '👑'
		};
		return icons[type] || '🏅';
	}

	function getAchievementName(type: string): string {
		const names: Record<string, string> = {
			FirstWin: 'First Victory!',
			Play10Games: 'Rookie Veteran!',
			Play50Games: 'Seasoned Player!',
			WinStreak3: 'Hot Streak!',
			PerfectPortfolio: 'Perfect Portfolio!',
			RisingStar: 'Rising Star!',
			Legend: 'Legendary Trader!'
		};
		return names[type] || type;
	}

	onMount(() => {
		const timer = setTimeout(onClose, 5000);
		return () => clearTimeout(timer);
	});
</script>

<div
	class="fixed top-4 right-4 z-50 max-w-sm rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 p-4 shadow-lg"
	transition:fly={{ y: -100, duration: 500 }}
>
	<button class="absolute top-2 right-2 text-white opacity-70 hover:opacity-100" on:click={onClose}>
		✕
	</button>
	<div class="flex items-center space-x-3">
		<div class="text-4xl">{getAchievementIcon(achievement.achievementType)}</div>
		<div>
			<p class="text-lg font-bold text-white">Achievement Unlocked!</p>
			<p class="text-sm text-white">{getAchievementName(achievement.achievementType)}</p>
		</div>
	</div>
</div>
