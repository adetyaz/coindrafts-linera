<script lang="ts">
	import { onMount } from 'svelte';
	import { todos, loading, error, wallet } from '$lib/stores';
	import { todoService } from '$lib/todoService';
	import { walletService } from '$lib/walletService';

	let newTodoText = '';

	onMount(async () => {
		// Check if wallet is already connected
		await walletService.checkConnection();
		
		// Fetch initial todos
		await todoService.fetchTodos();
	});

	async function handleAddTodo() {
		if (newTodoText.trim()) {
			try {
				await todoService.addTodo(newTodoText);
				newTodoText = '';
			} catch (err) {
				console.error('Failed to add todo:', err);
			}
		}
	}

	async function handleToggleTodo(id: number) {
		try {
			await todoService.toggleTodo(id);
		} catch (err) {
			console.error('Failed to toggle todo:', err);
		}
	}

	async function handleDeleteTodo(id: number) {
		try {
			await todoService.deleteTodo(id);
		} catch (err) {
			console.error('Failed to delete todo:', err);
		}
	}

	async function handleConnectWallet() {
		try {
			await walletService.connectWallet();
		} catch (err) {
			console.error('Failed to connect wallet:', err);
		}
	}

	async function handleDisconnectWallet() {
		await walletService.disconnectWallet();
	}
</script>

<div class="container mx-auto p-6 max-w-2xl">
	<header class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">CoinDrafts Todo Demo</h1>
		<p class="text-gray-600">Simple todo app built on Linera blockchain</p>
		
		<!-- Wallet Connection -->
		<div class="mt-4 p-4 bg-gray-50 rounded-lg">
			{#if $wallet.connected}
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-gray-700">Connected: {$wallet.address?.slice(0, 8)}...{$wallet.address?.slice(-6)}</p>
						<p class="text-xs text-gray-500">Chain ID: {$wallet.chainId}</p>
					</div>
					<button 
						on:click={handleDisconnectWallet}
						class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
					>
						Disconnect
					</button>
				</div>
			{:else}
				<button 
					on:click={handleConnectWallet}
					class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
				>
					Connect Wallet
				</button>
			{/if}
		</div>
	</header>

	<!-- Add Todo Form -->
	<div class="mb-6">
		<div class="flex gap-2">
			<input
				bind:value={newTodoText}
				on:keydown={(e) => e.key === 'Enter' && handleAddTodo()}
				placeholder="Enter a new todo..."
				class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				disabled={$loading}
			/>
			<button
				on:click={handleAddTodo}
				disabled={$loading || !newTodoText.trim()}
				class="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg"
			>
				Add
			</button>
		</div>
	</div>

	<!-- Error Display -->
	{#if $error}
		<div class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
			Error: {$error}
		</div>
	{/if}

	<!-- Loading Indicator -->
	{#if $loading}
		<div class="text-center py-4">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
			<p class="mt-2 text-gray-600">Loading...</p>
		</div>
	{/if}

	<!-- Todo List -->
	<div class="space-y-2">
		{#if $todos.length === 0 && !$loading}
			<p class="text-gray-500 text-center py-8">No todos yet. Add one above!</p>
		{:else}
			{#each $todos as todo (todo.id)}
				<div class="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
					<input
						type="checkbox"
						checked={todo.completed}
						on:change={() => handleToggleTodo(todo.id)}
						class="w-5 h-5 text-blue-600"
					/>
					<span class="flex-1 {todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}">
						{todo.text}
					</span>
					<span class="text-xs text-gray-400">
						{new Date(todo.created_at / 1000).toLocaleDateString()}
					</span>
					<button
						on:click={() => handleDeleteTodo(todo.id)}
						class="text-red-500 hover:text-red-700 text-sm"
					>
						Delete
					</button>
				</div>
			{/each}
		{/if}
	</div>

	<!-- Connection Status -->
	<footer class="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
		<p><strong>Linera Service:</strong> http://localhost:8080</p>
		<p><strong>Status:</strong> {$loading ? 'Loading...' : 'Ready'}</p>
		<p class="text-xs mt-2">
			This demo connects to a local Linera network. Make sure your Linera service is running.
		</p>
	</footer>
</div>
