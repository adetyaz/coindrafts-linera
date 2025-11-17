<script lang="ts">
	import { onMount } from 'svelte';
	import { CheckCircle, AlertCircle, X, Info } from '@lucide/svelte';

	interface ToastProps {
		message: string;
		type: 'success' | 'error' | 'info';
		duration?: number;
		onClose: () => void;
	}

	let { message, type, duration = 5000, onClose }: ToastProps = $props();

	let visible = $state(true);
	let timeoutId: number;

	onMount(() => {
		timeoutId = window.setTimeout(() => {
			close();
		}, duration);

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});

	function close() {
		visible = false;
		setTimeout(() => {
			onClose();
		}, 300); // Wait for animation
	}

	function getToastStyles(type: string): string {
		switch (type) {
			case 'success':
				return 'bg-green-900/90 border-green-500 text-green-400';
			case 'error':
				return 'bg-red-900/90 border-red-500 text-red-400';
			case 'info':
				return 'bg-blue-900/90 border-blue-500 text-blue-400';
			default:
				return 'bg-gray-900/90 border-gray-500 text-gray-400';
		}
	}

	function getIcon(type: string) {
		switch (type) {
			case 'success':
				return CheckCircle;
			case 'error':
				return AlertCircle;
			case 'info':
				return Info;
			default:
				return Info;
		}
	}
</script>

{#if visible}
	<div 
		class="fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out"
		class:translate-y-0={visible}
		class:opacity-100={visible}
		class:translate-y-[-100%]={!visible}
		class:opacity-0={!visible}
	>
		<div class="rounded-lg border-2 p-4 shadow-lg backdrop-blur-sm {getToastStyles(type)}">
			<div class="flex items-start gap-3">
				<svelte:component this={getIcon(type)} size={20} class="shrink-0 mt-0.5" />
				<div class="flex-1 text-sm font-medium">
					{message}
				</div>
				<button
					onclick={close}
					class="shrink-0 text-current hover:opacity-70 transition-opacity cursor-pointer"
				>
					<X size={16} />
				</button>
			</div>
		</div>
	</div>
{/if}