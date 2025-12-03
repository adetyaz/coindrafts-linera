<script lang="ts">
	import '../app.css';
	import '$lib/appkit'; // Initialize Reown AppKit
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/Navigation.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	
	let { children } = $props();
	
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-black">
	<Navigation />
	<main>
		{@render children()}
	</main>
	<ToastContainer />
</div>
