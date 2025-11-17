<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/Navigation.svelte';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen" style="background: linear-gradient(135deg, #581c87 0%, #1e3a8a 50%, #312e81 100%)">
	<Navigation />
	<main>
		{@render children()}
	</main>
</div>
