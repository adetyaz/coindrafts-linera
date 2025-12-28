<script lang="ts">
	import { Share2, Twitter, Link, Check } from '@lucide/svelte';
	import { shareToTwitter, copyToClipboard, shareNative } from '$lib/services/shareService';
	import { addToast } from '$lib/stores/toasts';

	interface Props {
		text: string;
		url: string;
		title?: string;
		variant?: 'default' | 'icon-only';
		size?: 'sm' | 'md' | 'lg';
	}

	let { text, url, title = 'CoinDrafts', variant = 'default', size = 'md' }: Props = $props();

	let showOptions = $state(false);
	let copied = $state(false);

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-5 py-3 text-lg'
	};

	const iconSizes = {
		sm: 16,
		md: 20,
		lg: 24
	};

	async function handleShare() {
		// Try native share first on mobile
		const nativeShared = await shareNative({ title, text, url });
		if (nativeShared) {
			return;
		}

		// Show options dropdown
		showOptions = !showOptions;
	}

	function handleTwitterShare() {
		shareToTwitter(text, url);
		showOptions = false;
		addToast('Opening Twitter...', 'info');
	}

	async function handleCopyLink() {
		const success = await copyToClipboard(url);
		if (success) {
			copied = true;
			addToast('Link copied to clipboard!', 'success');
			setTimeout(() => {
				copied = false;
				showOptions = false;
			}, 2000);
		} else {
			addToast('Failed to copy link', 'error');
		}
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (showOptions) {
			const target = event.target as HTMLElement;
			if (!target.closest('.share-button-container')) {
				showOptions = false;
			}
		}
	}

	$effect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('click', handleClickOutside);
			return () => window.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="share-button-container relative inline-block">
	{#if variant === 'icon-only'}
		<button
			type="button"
			onclick={handleShare}
			class="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 hover:border-[#39ff14]/50 transition-all"
			title="Share"
		>
			<Share2 size={iconSizes[size]} class="text-gray-300" />
		</button>
	{:else}
		<button
			type="button"
			onclick={handleShare}
			class="flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all {sizeClasses[size]}"
		>
			<Share2 size={iconSizes[size]} />
			<span>Share</span>
		</button>
	{/if}

	{#if showOptions}
		<div
			class="absolute top-full mt-2 right-0 bg-gray-800 border border-white/20 rounded-lg shadow-xl z-50 min-w-[200px] overflow-hidden"
		>
			<button
				type="button"
				onclick={handleTwitterShare}
				class="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
			>
				<Twitter size={20} class="text-[#1DA1F2]" />
				<span class="text-white">Share on Twitter</span>
			</button>

			<button
				type="button"
				onclick={handleCopyLink}
				class="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left border-t border-white/10"
			>
				{#if copied}
					<Check size={20} class="text-green-400" />
					<span class="text-green-400">Copied!</span>
				{:else}
					<Link size={20} class="text-gray-300" />
					<span class="text-white">Copy Link</span>
				{/if}
			</button>
		</div>
	{/if}
</div>

<style>
	.share-button-container {
		z-index: 10;
	}
</style>
