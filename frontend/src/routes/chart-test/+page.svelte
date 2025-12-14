<script lang="ts">
	import { onMount } from 'svelte';
	import { createChart, LineSeries, AreaSeries } from 'lightweight-charts';
	import { priceService } from '$lib/services/priceService';

	let chartContainer: HTMLDivElement;
	let chart: any;
	let seriesMap: Map<string, any> = new Map();
	let startingPrices: Map<string, number> = new Map();
	let chartType = $state<'line' | 'area'>('line');
	
	// Test cryptos to display with toggle state
	let testCryptos = $state([
		{ id: 'bitcoin', name: 'Bitcoin', color: '#F7931A', visible: true },
		{ id: 'ethereum', name: 'Ethereum', color: '#627EEA', visible: true },
		{ id: 'solana', name: 'Solana', color: '#14F195', visible: true },
		{ id: 'cardano', name: 'Cardano', color: '#0033AD', visible: true },
		{ id: 'polkadot', name: 'Polkadot', color: '#E6007A', visible: true }
	]);

	let updateInterval: ReturnType<typeof setInterval>;
	let isLoading = $state(true);
	let historicalData: Map<string, Array<{time: number, value: number}>> = new Map();

	onMount(() => {
		// Get actual width from parent container
		const containerWidth = chartContainer.parentElement?.clientWidth || 1200;
		
		// Create chart
		chart = createChart(chartContainer, {
			layout: {
				textColor: '#39ff14',
				background: { color: '#000000' }
			},
			width: containerWidth,
			height: 600,
			grid: {
				vertLines: { color: '#1a1a1a' },
				horzLines: { color: '#1a1a1a' },
			},
			rightPriceScale: {
				borderColor: '#39ff14',
			},
			timeScale: {
				borderColor: '#39ff14',
				timeVisible: true,
				secondsVisible: false,
			},
		});

		// Create series for each crypto
		createSeries();

		// Initial load
		loadPrices();

		// Update prices every 10 seconds
		updateInterval = setInterval(() => {
			loadPrices();
		}, 10000);

		// Handle window resize
		const handleResize = () => {
			chart.applyOptions({ width: chartContainer.clientWidth });
		};
		window.addEventListener('resize', handleResize);

		return () => {
			clearInterval(updateInterval);
			window.removeEventListener('resize', handleResize);
			chart.remove();
		};
	});

	async function loadPrices() {
		try {
			const cryptoIds = testCryptos.map(c => c.id);
			const prices = await priceService.getCurrentPrices(cryptoIds);
			const timestamp = Math.floor(Date.now() / 1000);
			
			prices.forEach(priceData => {
				// Store starting price on first load
				if (!startingPrices.has(priceData.id)) {
					startingPrices.set(priceData.id, priceData.priceUsd);
				}
				
				// Calculate percentage change from starting price
				const startPrice = startingPrices.get(priceData.id) || priceData.priceUsd;
				const percentChange = ((priceData.priceUsd - startPrice) / startPrice) * 100;
				
				// Store historical data
				if (!historicalData.has(priceData.id)) {
					historicalData.set(priceData.id, []);
				}
				const history = historicalData.get(priceData.id)!;
				history.push({ time: timestamp, value: percentChange });
				
				// Keep only last 50 data points
				if (history.length > 50) {
					history.shift();
				}
				
				// Update series with percentage change data
				const lineSeries = seriesMap.get(priceData.id);
				const crypto = testCryptos.find(c => c.id === priceData.id);
				if (lineSeries && crypto?.visible) {
					lineSeries.setData(history);
				}
			});

			chart.timeScale().fitContent();
			isLoading = false;
		} catch (error) {
			console.error('Error loading prices:', error);
			isLoading = false;
		}
	}
	
	function createSeries() {
		// Clear existing series
		seriesMap.forEach(series => chart.removeSeries(series));
		seriesMap.clear();
		
		// Create new series based on chart type
		const SeriesType = chartType === 'area' ? AreaSeries : LineSeries;
		
		testCryptos.forEach(crypto => {
			const series = chart.addSeries(SeriesType, {
				lineColor: crypto.color,
				topColor: chartType === 'area' ? crypto.color + '80' : undefined,
				bottomColor: chartType === 'area' ? crypto.color + '00' : undefined,
				lineWidth: 2,
			});
			seriesMap.set(crypto.id, series);
			
			// Restore historical data if visible
			const history = historicalData.get(crypto.id);
			if (history && crypto.visible) {
				series.setData(history);
			}
		});
	}
	
	function switchChartType(type: 'line' | 'area') {
		chartType = type;
		createSeries();
		chart.timeScale().fitContent();
	}
	
	function toggleCrypto(cryptoId: string) {
		const crypto = testCryptos.find(c => c.id === cryptoId);
		if (!crypto) return;
		
		crypto.visible = !crypto.visible;
		const lineSeries = seriesMap.get(cryptoId);
		const history = historicalData.get(cryptoId);
		
		if (lineSeries && history) {
			if (crypto.visible) {
				lineSeries.setData(history);
			} else {
				lineSeries.setData([]);
			}
		}
	}
</script>

<div class="min-h-screen bg-black text-green-400 p-6">
	<div class="max-w-full mx-auto px-4">
		<div class="mb-8">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h1 class="text-4xl font-bold text-green-400 mb-2">Real-Time Crypto Chart Test</h1>
					<p class="text-text-secondary">Testing Lightweight Charts with multiple cryptocurrencies</p>
				</div>
				
				<!-- Chart Type Toggle -->
				<div class="flex gap-2 bg-gray-900 rounded-lg p-1 border border-green-500/20">
					<button
						onclick={() => switchChartType('line')}
						class="px-4 py-2 rounded-md transition-colors font-medium"
						class:bg-green-500={chartType === 'line'}
						class:text-black={chartType === 'line'}
						class:text-green-400={chartType !== 'line'}
					>
						Line Chart
					</button>
					<button
						onclick={() => switchChartType('area')}
						class="px-4 py-2 rounded-md transition-colors font-medium"
						class:bg-green-500={chartType === 'area'}
						class:text-black={chartType === 'area'}
						class:text-green-400={chartType !== 'area'}
					>
						Area Chart
					</button>
				</div>
			</div>
		</div>

		{#if isLoading}
			<div class="bg-gray-900 rounded-lg p-8 text-center">
				<div class="text-green-400 text-xl">.</div>
			</div>
		{/if}

		<!-- Chart container (always rendered) -->
		<div class="bg-gray-900 rounded-lg p-6 border border-green-500/20 mb-6" class:hidden={isLoading}>
			<div bind:this={chartContainer}></div>
		</div>

		<!-- Legend with Toggles -->
		<div class="bg-gray-900 rounded-lg p-6 border border-green-500/20" class:hidden={isLoading}>
			<h2 class="text-xl font-bold text-green-400 mb-4">Tracked Cryptocurrencies (Click to Toggle)</h2>
			<div class="grid grid-cols-2 md:grid-cols-5 gap-4">
				{#each testCryptos as crypto}
					<button
						onclick={() => toggleCrypto(crypto.id)}
						class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
						class:opacity-50={!crypto.visible}
					>
						<div 
							class="w-4 h-4 rounded-full" 
							style="background-color: {crypto.color}"
						></div>
						<span class="text-white font-medium">{crypto.name}</span>
						{#if !crypto.visible}
							<span class="text-xs text-gray-500">(hidden)</span>
						{/if}
					</button>
				{/each}
			</div>
			<p class="text-text-secondary text-sm mt-4">
				📊 Showing <strong>percentage change</strong> from starting price. Updates every 10 seconds.
			</p>
		</div>

		<div class="mt-6">
			<a 
				href="/tournaments" 
				class="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
			>
				← Back to Tournaments
			</a>
		</div>
	</div>
</div>
