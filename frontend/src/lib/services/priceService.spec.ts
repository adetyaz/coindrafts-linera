import { describe, it, expect } from 'vitest';
import {
	getCurrentPrices,
	getPriceSnapshot,
	calculatePriceChanges,
	formatPrice,
	formatPercentChange,
	type PriceSnapshot
} from './priceService';

describe('Price Service', () => {
	// Note: These are integration tests that hit the real API
	// They may be slow and count against API quota

	it('should fetch current prices for multiple cryptos', async () => {
		const cryptos = ['bitcoin', 'ethereum', 'solana'];
		const prices = await getCurrentPrices(cryptos);

		expect(prices).toHaveLength(3);
		expect(prices[0]).toHaveProperty('id');
		expect(prices[0]).toHaveProperty('symbol');
		expect(prices[0]).toHaveProperty('priceUsd');
		expect(prices[0].priceUsd).toBeGreaterThan(0);
	}, 10000);

	it('should create price snapshot with current prices', async () => {
		const cryptos = ['bitcoin', 'ethereum'];
		const snapshot = await getPriceSnapshot(cryptos);

		expect(snapshot).toHaveProperty('timestamp');
		expect(snapshot).toHaveProperty('prices');
		expect(snapshot.prices['bitcoin']).toBeGreaterThan(0);
		expect(snapshot.prices['ethereum']).toBeGreaterThan(0);
	}, 10000);

	it('should calculate price changes between snapshots', () => {
		const startSnapshot: PriceSnapshot = {
			timestamp: Date.now() - 3600000,
			prices: {
				bitcoin: 90000,
				ethereum: 3000
			}
		};

		const endSnapshot: PriceSnapshot = {
			timestamp: Date.now(),
			prices: {
				bitcoin: 85500, // -5% change
				ethereum: 3150 // +5% change
			}
		};

		const changes = calculatePriceChanges(startSnapshot, endSnapshot);

		expect(changes).toHaveLength(2);
		expect(changes[0].cryptoId).toBe('bitcoin');
		expect(changes[0].percentChange).toBeCloseTo(-5, 1);
		expect(changes[1].cryptoId).toBe('ethereum');
		expect(changes[1].percentChange).toBeCloseTo(5, 1);
	});

	it('should format prices correctly', () => {
		expect(formatPrice(84714)).toBe('$84,714.00');
		expect(formatPrice(2739.21)).toBe('$2,739.21');
		expect(formatPrice(0.5)).toBe('$0.50');
		expect(formatPrice(0.005)).toBe('$0.0050');
		expect(formatPrice(0.000012)).toBe('$0.000012');
	});

	it('should format percent changes correctly', () => {
		expect(formatPercentChange(5.5)).toBe('+5.50%');
		expect(formatPercentChange(-3.2)).toBe('-3.20%');
		expect(formatPercentChange(0)).toBe('+0.00%');
	});
});
