<script lang="ts">
	import { toasts, removeToast } from '$lib/stores/toasts';
	import Toast from '$lib/components/Toast.svelte';
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
	{#each $toasts as toast (toast.id)}
		<div class="pointer-events-auto">
			<Toast
				message={toast.message}
				type={toast.type}
				duration={toast.duration}
				onClose={() => removeToast(toast.id)}
			/>
		</div>
	{/each}
</div>