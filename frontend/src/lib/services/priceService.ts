/**
 * CoinCap Price Service
 * Handles all cryptocurrency price data fetching and calculations
 */

const API_KEY = '16cd2c6e58545a8be5c66ce7c891c2e664303de43d35e6cb1f447ddf7d0bb857';
const BASE_URL = 'https://rest.coincap.io/v3';

// Request headers with authentication
const headers = {
	Authorization: `Bearer ${API_KEY}`,
	'Content-Type': 'application/json'
};

export interface PriceData {
	id: string;
	symbol: string;
	name: string;
	priceUsd: number;
	changePercent24Hr: number;
	marketCapUsd: number;
	volumeUsd24Hr: number;
}

export interface PriceSnapshot {
	timestamp: number;
	prices: Record<string, number>; // { "bitcoin": 84714.00, "ethereum": 2739.21, ... }
}

export interface PriceChange {
	cryptoId: string;
	symbol: string;
	startPrice: number;
	endPrice: number;
	percentChange: number;
}

export interface HistoricalDataPoint {
	time: number;
	priceUsd: number;
	date: string;
}

export interface HistoricalData {
	cryptoId: string;
	interval: string;
	data: HistoricalDataPoint[];
}

/**
 * Fetch current prices for multiple cryptocurrencies
 * @param cryptoSlugs Array of CoinCap crypto IDs (e.g., ["bitcoin", "ethereum", "solana"])
 * @returns Array of price data for each crypto
 */
export async function getCurrentPrices(cryptoSlugs: string[]): Promise<PriceData[]> {
	try {
		const slugsParam = cryptoSlugs.join(',');
		const response = await fetch(`${BASE_URL}/assets?slugs=${slugsParam}`, { headers });

		if (!response.ok) {
			throw new Error(`CoinCap API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();

		return data.data.map((asset: any) => ({
			id: asset.id,
			symbol: asset.symbol,
			name: asset.name,
			priceUsd: parseFloat(asset.priceUsd),
			changePercent24Hr: parseFloat(asset.changePercent24Hr),
			marketCapUsd: parseFloat(asset.marketCapUsd),
			volumeUsd24Hr: parseFloat(asset.volumeUsd24Hr)
		}));
	} catch (error) {
		console.error('Error fetching current prices:', error);
		throw error;
	}
}

/**
 * Create a price snapshot at a specific point in time
 * Used for capturing prices when tournaments start/end
 * @param cryptoSlugs Array of crypto IDs to snapshot
 * @param timestamp Optional timestamp (defaults to now)
 * @returns Price snapshot with timestamp and price map
 */
export async function getPriceSnapshot(
	cryptoSlugs: string[],
	timestamp?: number
): Promise<PriceSnapshot> {
	const now = timestamp || Date.now();

	// If timestamp is in the past, use historical data
	if (timestamp && timestamp < Date.now() - 60000) {
		return getHistoricalSnapshot(cryptoSlugs, timestamp);
	}

	// Otherwise use current prices
	const prices = await getCurrentPrices(cryptoSlugs);

	const priceMap: Record<string, number> = {};
	prices.forEach((price) => {
		priceMap[price.id] = price.priceUsd;
	});

	return {
		timestamp: now,
		prices: priceMap
	};
}

/**
 * Get historical snapshot (for past timestamps)
 * @param cryptoSlugs Array of crypto IDs
 * @param timestamp Target timestamp
 * @returns Historical price snapshot
 */
async function getHistoricalSnapshot(
	cryptoSlugs: string[],
	timestamp: number
): Promise<PriceSnapshot> {
	const priceMap: Record<string, number> = {};

	// Fetch historical data for each crypto
	// Use 5-minute window around target timestamp
	const start = timestamp - 300000; // 5 minutes before
	const end = timestamp + 300000; // 5 minutes after

	for (const slug of cryptoSlugs) {
		try {
			const response = await fetch(
				`${BASE_URL}/assets/${slug}/history?interval=m1&start=${start}&end=${end}`,
				{ headers }
			);

			if (!response.ok) {
				console.warn(`Failed to fetch historical data for ${slug}`);
				continue;
			}

			const data = await response.json();

			// Find closest price to target timestamp
			if (data.data && data.data.length > 0) {
				const closest = data.data.reduce((prev: any, curr: any) => {
					const prevDiff = Math.abs(prev.time - timestamp);
					const currDiff = Math.abs(curr.time - timestamp);
					return currDiff < prevDiff ? curr : prev;
				});

				priceMap[slug] = parseFloat(closest.priceUsd);
			}
		} catch (error) {
			console.error(`Error fetching historical data for ${slug}:`, error);
		}

		// Rate limiting: wait 100ms between requests
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	return {
		timestamp,
		prices: priceMap
	};
}

/**
 * Calculate price changes between two snapshots
 * @param startSnapshot Snapshot from tournament start
 * @param endSnapshot Snapshot from tournament end
 * @returns Array of price changes with percentage calculations
 */
export function calculatePriceChanges(
	startSnapshot: PriceSnapshot,
	endSnapshot: PriceSnapshot
): PriceChange[] {
	const changes: PriceChange[] = [];

	for (const [cryptoId, startPrice] of Object.entries(startSnapshot.prices)) {
		const endPrice = endSnapshot.prices[cryptoId];

		if (endPrice !== undefined) {
			const percentChange = ((endPrice - startPrice) / startPrice) * 100;

			changes.push({
				cryptoId,
				symbol: cryptoId.toUpperCase(),
				startPrice,
				endPrice,
				percentChange
			});
		}
	}

	return changes;
}

/**
 * Get historical price data for charting
 * @param cryptoSlug CoinCap crypto ID (e.g., "bitcoin")
 * @param interval Time interval: "m1", "m5", "m15", "m30", "h1", "h2", "h6", "h12", "d1"
 * @param start Start timestamp (ms)
 * @param end End timestamp (ms)
 * @returns Historical price data points
 */
export async function getPriceHistory(
	cryptoSlug: string,
	interval: string = 'h1',
	start?: number,
	end?: number
): Promise<HistoricalData> {
	try {
		// Default to last 24 hours if no range provided
		const endTime = end || Date.now();
		const startTime = start || endTime - 24 * 60 * 60 * 1000;

		const response = await fetch(
			`${BASE_URL}/assets/${cryptoSlug}/history?interval=${interval}&start=${startTime}&end=${endTime}`,
			{ headers }
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch history for ${cryptoSlug}`);
		}

		const result = await response.json();

		return {
			cryptoId: cryptoSlug,
			interval,
			data: result.data.map((point: any) => ({
				time: point.time,
				priceUsd: parseFloat(point.priceUsd),
				date: point.date
			}))
		};
	} catch (error) {
		console.error(`Error fetching price history for ${cryptoSlug}:`, error);
		throw error;
	}
}

/**
 * Get price changes for multiple cryptos over a time period
 * Useful for tournament summaries
 * @param cryptoSlugs Array of crypto IDs
 * @param hours Number of hours to look back
 * @returns Map of crypto ID to percentage change
 */
export async function getPriceChangesOverPeriod(
	cryptoSlugs: string[],
	hours: number = 24
): Promise<Record<string, number>> {
	const now = Date.now();
	const past = now - hours * 60 * 60 * 1000;

	const startSnapshot = await getPriceSnapshot(cryptoSlugs, past);
	const endSnapshot = await getPriceSnapshot(cryptoSlugs, now);

	const changes = calculatePriceChanges(startSnapshot, endSnapshot);

	const changeMap: Record<string, number> = {};
	changes.forEach((change) => {
		changeMap[change.cryptoId] = change.percentChange;
	});

	return changeMap;
}

/**
 * Format price for display
 * @param price Price in USD
 * @returns Formatted string with appropriate decimals
 */
export function formatPrice(price: number): string {
	if (price >= 1000) {
		return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	} else if (price >= 1) {
		return `$${price.toFixed(2)}`;
	} else if (price >= 0.01) {
		return `$${price.toFixed(4)}`;
	} else {
		return `$${price.toFixed(6)}`;
	}
}

/**
 * Format percentage change for display
 * @param change Percentage change value
 * @returns Formatted string with + or - prefix
 */
export function formatPercentChange(change: number): string {
	const prefix = change >= 0 ? '+' : '';
	return `${prefix}${change.toFixed(2)}%`;
}

/**
 * Validate crypto slug exists in CoinCap
 * @param cryptoSlug CoinCap crypto ID
 * @returns True if crypto exists
 */
export async function validateCryptoSlug(cryptoSlug: string): Promise<boolean> {
	try {
		const response = await fetch(`${BASE_URL}/assets/${cryptoSlug}`, { headers });
		return response.ok;
	} catch {
		return false;
	}
}

// Export a singleton instance for easy imports
export const priceService = {
	getCurrentPrices,
	getPriceSnapshot,
	calculatePriceChanges,
	getPriceHistory,
	getPriceChangesOverPeriod,
	formatPrice,
	formatPercentChange,
	validateCryptoSlug
};

export default priceService;
