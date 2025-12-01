/**
 * Cryptocurrency Categories for CoinDrafts Tournaments
 *
 * Each category provides a focused pool of cryptos for themed tournaments,
 * making strategy more interesting and decisions easier.
 */

export interface CryptoInfo {
	id: string; // CoinCap API slug
	symbol: string; // Display symbol (BTC, ETH, etc.)
	name: string; // Full name
}

export interface Category {
	name: string;
	description: string;
	cryptos: CryptoInfo[];
}

export const CRYPTO_CATEGORIES: Record<string, Category> = {
	L1_CHAINS: {
		name: 'Layer 1 Blockchains',
		description: 'Major base-layer blockchain platforms',
		cryptos: [
			{ id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
			{ id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
			{ id: 'solana', symbol: 'SOL', name: 'Solana' },
			{ id: 'cardano', symbol: 'ADA', name: 'Cardano' },
			{ id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
			{ id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
			{ id: 'algorand', symbol: 'ALGO', name: 'Algorand' },
			{ id: 'cosmos', symbol: 'ATOM', name: 'Cosmos' },
			{ id: 'near-protocol', symbol: 'NEAR', name: 'NEAR Protocol' },
			{ id: 'aptos', symbol: 'APT', name: 'Aptos' }
		]
	},

	L2_CHAINS: {
		name: 'Layer 2 Solutions',
		description: 'Scaling solutions built on top of L1s',
		cryptos: [
			{ id: 'polygon', symbol: 'MATIC', name: 'Polygon' },
			{ id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum' },
			{ id: 'optimism', symbol: 'OP', name: 'Optimism' },
			{ id: 'immutable-x', symbol: 'IMX', name: 'Immutable X' },
			{ id: 'loopring', symbol: 'LRC', name: 'Loopring' },
			{ id: 'metis', symbol: 'METIS', name: 'Metis' },
			{ id: 'boba-network', symbol: 'BOBA', name: 'Boba Network' },
			{ id: 'starknet', symbol: 'STRK', name: 'Starknet' }
		]
	},

	MEME_COINS: {
		name: 'Meme Coins',
		description: 'Community-driven meme cryptocurrencies',
		cryptos: [
			{ id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
			{ id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu' },
			{ id: 'pepe', symbol: 'PEPE', name: 'Pepe' },
			{ id: 'floki', symbol: 'FLOKI', name: 'Floki Inu' },
			{ id: 'bonk', symbol: 'BONK', name: 'Bonk' },
			{ id: 'dogwifhat', symbol: 'WIF', name: 'dogwifhat' },
			{ id: 'baby-doge-coin', symbol: 'BABYDOGE', name: 'Baby Doge Coin' },
			{ id: 'wojak', symbol: 'WOJAK', name: 'Wojak' }
		]
	},

	DEFI_TOKENS: {
		name: 'DeFi Protocols',
		description: 'Decentralized finance protocol tokens',
		cryptos: [
			{ id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
			{ id: 'aave', symbol: 'AAVE', name: 'Aave' },
			{ id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
			{ id: 'curve-dao-token', symbol: 'CRV', name: 'Curve DAO' },
			{ id: 'maker', symbol: 'MKR', name: 'Maker' },
			{ id: 'compound', symbol: 'COMP', name: 'Compound' },
			{ id: 'synthetix-network-token', symbol: 'SNX', name: 'Synthetix' },
			{ id: 'the-graph', symbol: 'GRT', name: 'The Graph' },
			{ id: 'pancakeswap', symbol: 'CAKE', name: 'PancakeSwap' },
			{ id: '1inch', symbol: '1INCH', name: '1inch' }
		]
	},

	ALL_CATEGORIES: {
		name: 'All Categories (Mixed)',
		description: 'Pick from any category - ultimate flexibility',
		cryptos: [] // Will be populated by combining all categories
	}
};

// Populate ALL_CATEGORIES with all cryptos
CRYPTO_CATEGORIES.ALL_CATEGORIES.cryptos = [
	...CRYPTO_CATEGORIES.L1_CHAINS.cryptos,
	...CRYPTO_CATEGORIES.L2_CHAINS.cryptos,
	...CRYPTO_CATEGORIES.MEME_COINS.cryptos,
	...CRYPTO_CATEGORIES.DEFI_TOKENS.cryptos
];

/**
 * Get category by key
 */
export function getCategory(key: string): Category | undefined {
	return CRYPTO_CATEGORIES[key];
}

/**
 * Get all category keys
 */
export function getCategoryKeys(): string[] {
	return Object.keys(CRYPTO_CATEGORIES);
}

/**
 * Get cryptos for a specific category
 */
export function getCryptosForCategory(categoryKey: string): CryptoInfo[] {
	return CRYPTO_CATEGORIES[categoryKey]?.cryptos || [];
}

/**
 * Get category display name
 */
export function getCategoryName(categoryKey: string): string {
	return CRYPTO_CATEGORIES[categoryKey]?.name || categoryKey;
}
