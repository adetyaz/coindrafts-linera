import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { PUBLIC_DEFAULT_CHAIN_ID, PUBLIC_PRICE_PREDICTION_APP_ID } from '$env/static/public';

const pricePredictionClient = new ApolloClient({
	link: new HttpLink({
		uri: `http://localhost:8081/chains/${PUBLIC_DEFAULT_CHAIN_ID}/applications/${PUBLIC_PRICE_PREDICTION_APP_ID}`
	}),
	cache: new InMemoryCache()
});

// Types
export interface PredictionMarket {
	id: string;
	cryptoId: string;
	creator: string;
	entryFee: number;
	startPrice: number;
	startTime: number;
	endTime: number;
	status: 'Active' | 'Settling' | 'Completed';
	finalPrice?: number;
}

export interface Prediction {
	player: string;
	marketId: string;
	minPrice: number;
	maxPrice: number;
	confidence: number;
	aiAssisted: boolean;
	submittedAt: number;
	multiplier?: number;
	reward?: number;
}

// GraphQL Response Types
interface ActiveMarketsQueryResult {
	activeMarkets: PredictionMarket[];
}

interface PredictionMarketQueryResult {
	predictionMarket: PredictionMarket | null;
}

interface MarketPredictionsQueryResult {
	marketPredictions: Prediction[];
}

interface MyPredictionsQueryResult {
	myPredictions: Prediction[];
}

// Queries
const GET_ACTIVE_MARKETS = gql`
	query GetActiveMarkets {
		activeMarkets {
			id
			cryptoId
			creator
			entryFee
			startPrice
			startTime
			endTime
			status
			finalPrice
		}
	}
`;

const GET_PREDICTION_MARKET = gql`
	query GetPredictionMarket($id: String!) {
		predictionMarket(id: $id) {
			id
			cryptoId
			creator
			entryFee
			startPrice
			startTime
			endTime
			status
			finalPrice
		}
	}
`;

const GET_MARKET_PREDICTIONS = gql`
	query GetMarketPredictions($marketId: String!) {
		marketPredictions(marketId: $marketId) {
			player
			marketId
			minPrice
			maxPrice
			confidence
			aiAssisted
			submittedAt
			multiplier
			reward
		}
	}
`;

const GET_MY_PREDICTIONS = gql`
	query GetMyPredictions($player: String!) {
		myPredictions(player: $player) {
			player
			marketId
			minPrice
			maxPrice
			confidence
			aiAssisted
			submittedAt
			multiplier
			reward
		}
	}
`;

// Mutations
const CREATE_MARKET = gql`
	mutation CreateMarket($cryptoId: String!, $entryFee: Int!, $durationDays: Int!) {
		createMarket(cryptoId: $cryptoId, entryFee: $entryFee, durationDays: $durationDays)
	}
`;

const SUBMIT_PREDICTION = gql`
	mutation SubmitPrediction(
		$marketId: String!
		$minPrice: Float!
		$maxPrice: Float!
		$confidence: Int!
		$aiAssisted: Boolean!
	) {
		submitPrediction(
			marketId: $marketId
			minPrice: $minPrice
			maxPrice: $maxPrice
			confidence: $confidence
			aiAssisted: $aiAssisted
		)
	}
`;

const SETTLE_MARKET = gql`
	mutation SettleMarket($marketId: String!, $finalPrice: Float!, $players: [String!]!) {
		settleMarket(marketId: $marketId, finalPrice: $finalPrice, players: $players)
	}
`;

// Service
class PricePredictionService {
	async fetchActiveMarkets(): Promise<PredictionMarket[]> {
		try {
			const result = await pricePredictionClient.query<ActiveMarketsQueryResult>({
				query: GET_ACTIVE_MARKETS
			});
			return result.data?.activeMarkets || [];
		} catch (error) {
			console.error('Failed to fetch active markets:', error);
			return [];
		}
	}

	async fetchPredictionMarket(id: string): Promise<PredictionMarket | null> {
		try {
			const result = await pricePredictionClient.query<PredictionMarketQueryResult>({
				query: GET_PREDICTION_MARKET,
				variables: { id }
			});
			return result.data?.predictionMarket || null;
		} catch (error) {
			console.error('Failed to fetch prediction market:', error);
			return null;
		}
	}

	async fetchMarketPredictions(marketId: string): Promise<Prediction[]> {
		try {
			const result = await pricePredictionClient.query<MarketPredictionsQueryResult>({
				query: GET_MARKET_PREDICTIONS,
				variables: { marketId }
			});
			return result.data?.marketPredictions || [];
		} catch (error) {
			console.error('Failed to fetch market predictions:', error);
			return [];
		}
	}

	async fetchMyPredictions(player: string): Promise<Prediction[]> {
		try {
			const result = await pricePredictionClient.query<MyPredictionsQueryResult>({
				query: GET_MY_PREDICTIONS,
				variables: { player }
			});
			return result.data?.myPredictions || [];
		} catch (error) {
			console.error('Failed to fetch my predictions:', error);
			return [];
		}
	}

	async createMarket(cryptoId: string, entryFee: number, durationDays: number): Promise<boolean> {
		try {
			await pricePredictionClient.mutate({
				mutation: CREATE_MARKET,
				variables: { cryptoId, entryFee, durationDays }
			});
			return true;
		} catch (error) {
			console.error('Failed to create market:', error);
			return false;
		}
	}

	async submitPrediction(
		marketId: string,
		minPrice: number,
		maxPrice: number,
		confidence: number,
		aiAssisted: boolean
	): Promise<boolean> {
		try {
			await pricePredictionClient.mutate({
				mutation: SUBMIT_PREDICTION,
				variables: { marketId, minPrice, maxPrice, confidence, aiAssisted }
			});
			return true;
		} catch (error) {
			console.error('Failed to submit prediction:', error);
			return false;
		}
	}

	async settleMarket(marketId: string, finalPrice: number, players: string[]): Promise<boolean> {
		try {
			await pricePredictionClient.mutate({
				mutation: SETTLE_MARKET,
				variables: { marketId, finalPrice, players }
			});
			return true;
		} catch (error) {
			console.error('Failed to settle market:', error);
			return false;
		}
	}

	// Helper: Calculate multiplier estimate
	calculateMultiplier(
		minPrice: number,
		maxPrice: number,
		confidence: number,
		aiAssisted: boolean
	): number {
		const rangeWidth = maxPrice - minPrice;

		let rangeMultiplier = 1.0;
		if (rangeWidth <= 1) rangeMultiplier = 20.0;
		else if (rangeWidth <= 5) rangeMultiplier = 10.0;
		else if (rangeWidth <= 10) rangeMultiplier = 5.0;
		else if (rangeWidth <= 20) rangeMultiplier = 2.5;
		else if (rangeWidth <= 50) rangeMultiplier = 1.5;

		const confidenceMultiplier = 1.0 + (confidence / 100.0) * 0.5;
		const aiPenalty = aiAssisted ? 0.8 : 1.0;

		return rangeMultiplier * confidenceMultiplier * aiPenalty;
	}

	// Fetch current price from CoinCap (using same working API as draft page)
	async fetchCurrentPrice(cryptoId: string): Promise<number | null> {
		try {
			const API_KEY = '16cd2c6e58545a8be5c66ce7c891c2e664303de43d35e6cb1f447ddf7d0bb857';
			const response = await fetch(`https://rest.coincap.io/v3/assets?slugs=${cryptoId}`, {
				headers: {
					Authorization: `Bearer ${API_KEY}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				console.error('CoinCap API error:', response.status, response.statusText);
				return null;
			}

			const data = await response.json();
			return data.data?.[0]?.priceUsd ? parseFloat(data.data[0].priceUsd) : null;
		} catch (error) {
			console.error('Failed to fetch current price:', error);
			return null;
		}
	}

	// Get AI-powered price range suggestions
	async getAISuggestion(
		cryptoId: string,
		currentPrice: number
	): Promise<{ minPrice: number; maxPrice: number } | null> {
		try {
			const response = await fetch('/api/ai-price-suggestion', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ cryptoId, currentPrice })
			});
			const data = await response.json();
			return data.suggestion || null;
		} catch (error) {
			console.error('Failed to get AI suggestion:', error);
			return null;
		}
	}
}

export const pricePredictionService = new PricePredictionService();
