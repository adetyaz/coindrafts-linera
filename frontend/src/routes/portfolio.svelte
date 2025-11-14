<script lang="ts">
	import { coinDraftsService } from '$lib/coinDraftsService';
	
	interface Props {
		gameId?: string;
		tournamentId?: string;
		mode?: 'game' | 'tournament';
	}
	
	let { gameId = '', tournamentId = '', mode = 'game' }: Props = $props();

	let selectedCryptos = $state<string[]>([]);
	let availableCryptos = [
		'BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP', 'DOT', 'DOGE',
		'AVAX', 'SHIB', 'MATIC', 'LTC', 'LINK', 'UNI', 'ATOM', 'ALGO',
		'ICP', 'VET', 'FIL', 'TRX', 'ETC', 'XMR', 'APE', 'SAND'
	];
	let searchTerm = $state('');
	let error = $state('');
	let submitting = $state(false);
	let submitted = $state(false);

	let filteredCryptos = $derived(availableCryptos.filter(crypto => 
		crypto.toLowerCase().includes(searchTerm.toLowerCase()) && 
		!selectedCryptos.includes(crypto)
	));

	let maxSelections = $derived(mode === 'game' ? 5 : 10);
	let canSubmit = $derived(selectedCryptos.length > 0 && selectedCryptos.length <= maxSelections);

	function addCrypto(crypto: string) {
		if (selectedCryptos.length < maxSelections) {
			selectedCryptos = [...selectedCryptos, crypto];
			searchTerm = '';
		}
	}

	function removeCrypto(crypto: string) {
		selectedCryptos = selectedCryptos.filter(c => c !== crypto);
	}

	async function submitPortfolio() {
		if (!canSubmit) return;

		submitting = true;
		error = '';

		try {
			if (mode === 'game' && gameId) {
				await coinDraftsService.submitPortfolio(gameId, selectedCryptos);
			} else if (mode === 'tournament' && tournamentId) {
				// For tournament mode, use the tournament ID as game ID for now
				// The backend will handle tournament-specific logic
				await coinDraftsService.submitPortfolio(tournamentId, selectedCryptos);
			}
			
			submitted = true;
		} catch (err) {
			error = `Error submitting portfolio: ${err}`;
		} finally {
			submitting = false;
		}
	}

	function reset() {
		selectedCryptos = [];
		submitted = false;
		error = '';
	}
</script>

<div class="max-w-2xl mx-auto p-6">
	<h2 class="text-2xl font-bold mb-6">
		Submit Portfolio - {mode === 'game' ? 'Game' : 'Tournament'}
	</h2>

	{#if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
			{error}
		</div>
	{/if}

	{#if submitted}
		<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
			<h3 class="font-bold">Portfolio Submitted Successfully!</h3>
			<p>Your portfolio has been submitted and is now being tracked.</p>
			<button 
				onclick={reset}
				class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
			>
				Submit Another Portfolio
			</button>
		</div>
	{:else}
		<div class="mb-6">
			<p class="text-gray-600 mb-4">
				Select up to {maxSelections} cryptocurrencies for your portfolio.
				Performance will be tracked and scored automatically.
			</p>
			
			<div class="mb-4">
				<div class="block text-gray-700 text-sm font-bold mb-2">
					Selected Cryptocurrencies ({selectedCryptos.length}/{maxSelections}):
				</div>
				
				{#if selectedCryptos.length === 0}
					<p class="text-gray-500 italic">No cryptocurrencies selected</p>
				{:else}
					<div class="flex flex-wrap gap-2 mb-4">
						{#each selectedCryptos as crypto}
							<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
								{crypto}
								<button 
									onclick={() => removeCrypto(crypto)}
									class="ml-2 text-blue-600 hover:text-red-600 font-bold"
								>
									×
								</button>
							</span>
						{/each}
					</div>
				{/if}
			</div>

			<div class="mb-6">
				<label for="cryptoSearch" class="block text-gray-700 text-sm font-bold mb-2">
					Add Cryptocurrency:
				</label>
				<input 
					id="cryptoSearch"
					bind:value={searchTerm}
					type="text" 
					placeholder="Search cryptocurrencies..."
					class="w-full px-3 py-2 border rounded"
					disabled={selectedCryptos.length >= maxSelections}
				/>
				
				{#if searchTerm && filteredCryptos.length > 0 && selectedCryptos.length < maxSelections}
					<div class="border border-gray-300 rounded mt-1 max-h-32 overflow-y-auto">
						{#each filteredCryptos.slice(0, 5) as crypto}
							<button 
								onclick={() => addCrypto(crypto)}
								class="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
							>
								{crypto}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="mb-6">
				<h3 class="text-lg font-semibold mb-2">Quick Add Popular Coins:</h3>
				<div class="flex flex-wrap gap-2">
					{#each ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP', 'DOT', 'DOGE'] as crypto}
						{#if !selectedCryptos.includes(crypto) && selectedCryptos.length < maxSelections}
							<button 
								onclick={() => addCrypto(crypto)}
								class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
							>
								+ {crypto}
							</button>
						{/if}
					{/each}
				</div>
			</div>

			<div class="flex justify-between items-center">
				<div class="text-sm text-gray-600">
					{#if selectedCryptos.length === 0}
						Please select at least 1 cryptocurrency
					{:else if selectedCryptos.length > maxSelections}
						Too many selected (max {maxSelections})
					{:else}
						Ready to submit ({selectedCryptos.length} selected)
					{/if}
				</div>
				
				<button 
					onclick={submitPortfolio}
					disabled={!canSubmit || submitting}
					class="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded"
				>
					{#if submitting}
						Submitting...
					{:else}
						Submit Portfolio
					{/if}
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Add any additional styling here */
</style>