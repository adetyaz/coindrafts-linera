<script lang="ts">
	import { onMount } from 'svelte';
	import { createChart, LineSeries, AreaSeries } from 'lightweight-charts';
	import { priceService } from '$lib/services/priceService';

	interface Props {
		cryptoIds: string[];
	}

	let { cryptoIds }: Props = $props();

	let chartContainer: HTMLDivElement;
	let chart: any;
	let seriesMap: Map<string, any> = new Map();
	let startingPrices: Map<string, number> = new Map();
	let chartType = $state<'line' | 'area'>('area');
	
	// Map crypto IDs to display names and colors
	const cryptoColors = new Map([
		['bitcoin', { name: 'Bitcoin', color: '#F7931A' }],
		['ethereum', { name: 'Ethereum', color: '#627EEA' }],
		['solana', { name: 'Solana', color: '#14F195' }],
		['cardano', { name: 'Cardano', color: '#0033AD' }],
		['polkadot', { name: 'Polkadot', color: '#E6007A' }],
		['binancecoin', { name: 'BNB', color: '#F3BA2F' }],
		['ripple', { name: 'XRP', color: '#23292F' }],
		['dogecoin', { name: 'Dogecoin', color: '#C3A634' }],
		['avalanche-2', { name: 'Avalanche', color: '#E84142' }],
		['chainlink', { name: 'Chainlink', color: '#375BD2' }],
		['polygon', { name: 'Polygon', color: '#8247E5' }],
		['uniswap', { name: 'Uniswap', color: '#FF007A' }],
		['litecoin', { name: 'Litecoin', color: '#345D9D' }],
		['stellar', { name: 'Stellar', color: '#000000' }],
		['monero', { name: 'Monero', color: '#FF6600' }]
	]);

	// Generate colors for cryptos dynamically if not in map
	function getColorForCrypto(id: string, index: number): string {
		const hue = (index * 137.5) % 360;
		// Convert HSL to hex color
		const h = hue;
		const s = 70;
		const l = 50;
		const a = s * Math.min(l, 100 - l) / 100;
		const f = (n: number) => {
			const k = (n + h / 30) % 12;
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
			return Math.round(255 * color / 100).toString(16).padStart(2, '0');
		};
		return `#${f(0)}${f(8)}${f(4)}`;
	}

	let cryptoList = $state<Array<{ id: string; name: string; color: string; visible: boolean }>>([]);
	let updateInterval: ReturnType<typeof setInterval>;
	let isLoading = $state(true);
	let historicalData: Map<string, Array<{time: number, value: number}>> = new Map();

	$effect(() => {
		// Update crypto list when cryptoIds changes
		cryptoList = cryptoIds.map((id, index) => {
			const info = cryptoColors.get(id);
			return {
				id,
				name: info?.name || id,
				color: info?.color || getColorForCrypto(id, index),
				visible: true
			};
		});
	});

	onMount(() => {
		// Get actual width from parent container
		const containerWidth = chartContainer.parentElement?.clientWidth || 800;
		
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
			if (chart && chartContainer.parentElement) {
				const newWidth = chartContainer.parentElement.clientWidth;
				chart.applyOptions({ width: newWidth });
			}
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
				const series = seriesMap.get(priceData.id);
				const crypto = cryptoList.find(c => c.id === priceData.id);
				if (series && crypto?.visible) {
					series.setData(history);
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
		
		cryptoList.forEach(crypto => {
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
		const crypto = cryptoList.find(c => c.id === cryptoId);
		if (!crypto) return;
		
		crypto.visible = !crypto.visible;
		const series = seriesMap.get(cryptoId);
		const history = historicalData.get(cryptoId);
		
		if (series && history) {
			if (crypto.visible) {
				series.setData(history);
			} else {
				series.setData([]);
			}
		}
	}
</script>

{#if !cryptoIds || cryptoIds.length === 0}
	<div class="bg-gray-900 rounded-lg p-8 text-center border border-yellow-500/20">
		<p class="text-yellow-400">No cryptocurrencies selected by participants yet.</p>
	</div>
{:else}
	<div class="space-y-6">
		<!-- Chart Type Toggle -->
		<div class="flex items-center justify-between">
			<h3 class="text-2xl font-bold text-green-400">Participant Crypto Performance</h3>
			<div class="flex gap-2 bg-gray-900 rounded-lg p-1 border border-green-500/20">
				<button
					onclick={() => switchChartType('line')}
					class="px-4 py-2 rounded-md transition-colors font-medium text-sm"
					class:bg-green-500={chartType === 'line'}
					class:text-black={chartType === 'line'}
					class:text-green-400={chartType !== 'line'}
				>
					Line Chart
				</button>
				<button
					onclick={() => switchChartType('area')}
					class="px-4 py-2 rounded-md transition-colors font-medium text-sm"
					class:bg-green-500={chartType === 'area'}
					class:text-black={chartType === 'area'}
					class:text-green-400={chartType !== 'area'}
				>
					Area Chart
				</button>
			</div>
		</div>

		{#if isLoading}
			<div class="bg-gray-900 rounded-lg p-8 text-center border border-green-500/20">
				<div class="text-green-400 text-xl mb-2">Loading price data...</div>
				<div class="text-gray-400 text-sm">Please wait while we fetch real-time cryptocurrency prices from CoinGecko API</div>
			</div>
		{/if}

		<!-- Chart container -->
		<div class="bg-gray-900 rounded-lg p-6 border border-green-500/20 w-full overflow-hidden" class:hidden={isLoading}>
			<div bind:this={chartContainer} class="w-full"></div>
		</div>

		<!-- Legend with Toggles -->
		<div class="bg-gray-900 rounded-lg p-6 border border-green-500/20" class:hidden={isLoading}>
			<h4 class="text-xl font-bold text-green-400 mb-4">Selected Cryptocurrencies (Click to Toggle)</h4>
			<div class="grid grid-cols-2 md:grid-cols-5 gap-4">
				{#each cryptoList as crypto}
					<button
						onclick={() => toggleCrypto(crypto.id)}
						class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
						class:opacity-50={!crypto.visible}
					>
						<div 
							class="w-4 h-4 rounded-full" 
							style="background-color: {crypto.color}"
						></div>
						<span class="text-white font-medium text-sm">{crypto.name}</span>
						{#if !crypto.visible}
							<span class="text-xs text-gray-500">(hidden)</span>
						{/if}
					</button>
				{/each}
			</div>
			<p class="text-text-secondary text-sm mt-4">
				Showing <strong>percentage change</strong> from starting price. Updates every 10 seconds.
			</p>
		</div>
	</div>
{/if}
