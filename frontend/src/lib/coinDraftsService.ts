import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import {
	PUBLIC_COINDRAFTS_CORE_APP_ID,
	PUBLIC_TRADITIONAL_LEAGUES_APP_ID,
	PUBLIC_DEFAULT_CHAIN_ID
} from '$env/static/public';

// Types
export interface Game {
	gameId: string;
	mode: string;
	status: string;
	createdAt: number;
	playerCount: number;
	maxPlayers: number;
	winners: string[];
	entryFeeUsdc: number;
}

export interface Tournament {
	id: string;
	name: string;
	tournamentType: string;
	status: string;
	entryFeeUsdc: number;
	maxParticipants: number;
	currentParticipants: number;
	createdAt: number;
	category?: string;
	startPrices?: PriceSnapshot[];
	endPrices?: PriceSnapshot[];
}

export interface PriceSnapshot {
	cryptoId: string;
	priceUsd: number;
	timestamp: number;
}

export interface MutationResult {
	success: boolean;
}

export interface PriceSnapshotInput {
	cryptoId: string; // Will be mapped to crypto_id for GraphQL
	priceUsd: number; // Will be mapped to price_usd for GraphQL (Micro-USDC)
	timestamp: number;
}

// Player and Portfolio types
export interface PlayerProfile {
	account: string;
	name: string;
	stats: {
		gamesPlayed: number;
		gamesWon: number;
	};
	totalEarningsUsdc: number;
	tier: string;
}

export interface Portfolio {
	playerAccount: string;
	holdings: Array<{ symbol: string; allocationPercent: number }>;
	submittedAt: number;
	status: string;
}

export interface TournamentPortfolio {
	cryptoPicks: string[];
	strategyNotes?: string | null;
}

export interface LeaderboardEntry {
	rank: number;
	playerAccount: string;
	totalReturn: number; // Scaled by 10000 (e.g., 12.50% = 125000)
	winningAmount: number; // USDC winnings in micro-units
}

// GraphQL Response Types
interface GamesQueryResult {
	games: Game[];
}

interface GameQueryResult {
	game: Game;
}

interface PlayersQueryResult {
	players: PlayerProfile[];
}

interface PortfoliosQueryResult {
	portfolios: Portfolio[];
}

interface TournamentsQueryResult {
	tournaments: Tournament[];
}

interface TournamentQueryResult {
	tournament: Tournament;
}

interface ActiveTournamentsQueryResult {
	activeTournaments: Tournament[];
}

interface TournamentParticipantsQueryResult {
	tournamentParticipants: string[];
}

interface TournamentResultsQueryResult {
	tournamentResults: string[];
}

interface TournamentLeaderboardQueryResult {
	tournamentLeaderboard: LeaderboardEntry[];
}

interface TournamentPortfolioQueryResult {
	playerPortfolio: TournamentPortfolio | null;
}

// Mutation Response Types
// Removed fake mutation result interfaces - using direct success checking instead

// Configuration - SvelteKit environment variables
const LINERA_GRAPHQL_BASE = 'http://localhost:8081';
const DEFAULT_CHAIN_ID = PUBLIC_DEFAULT_CHAIN_ID;

// Application IDs - MUST be set via environment variables after deployment
const COINDRAFTS_CORE_APP_ID = PUBLIC_COINDRAFTS_CORE_APP_ID;
const TRADITIONAL_LEAGUES_APP_ID = PUBLIC_TRADITIONAL_LEAGUES_APP_ID;

// Validate that application IDs are available
if (!COINDRAFTS_CORE_APP_ID || !TRADITIONAL_LEAGUES_APP_ID) {
	throw new Error(
		'Application IDs not found! Please run the deployment script first.\n' +
			'Missing: ' +
			(!COINDRAFTS_CORE_APP_ID ? 'PUBLIC_COINDRAFTS_CORE_APP_ID ' : '') +
			(!TRADITIONAL_LEAGUES_APP_ID ? 'PUBLIC_TRADITIONAL_LEAGUES_APP_ID' : '')
	);
}

// GraphQL Clients
const coinDraftsClient = new ApolloClient({
	link: new HttpLink({
		uri: `${LINERA_GRAPHQL_BASE}/chains/${DEFAULT_CHAIN_ID}/applications/${COINDRAFTS_CORE_APP_ID}`
	}),
	cache: new InMemoryCache(),
	defaultOptions: {
		query: { errorPolicy: 'all' },
		mutate: { errorPolicy: 'all', fetchPolicy: 'no-cache' }
	}
});

const tradLeaguesClient = new ApolloClient({
	link: new HttpLink({
		uri: `${LINERA_GRAPHQL_BASE}/chains/${DEFAULT_CHAIN_ID}/applications/${TRADITIONAL_LEAGUES_APP_ID}`
	}),
	cache: new InMemoryCache(),
	defaultOptions: {
		query: { errorPolicy: 'all' },
		mutate: { errorPolicy: 'ignore', fetchPolicy: 'no-cache' }
	}
});

// GraphQL Queries - Using ACTUAL schema from deployed applications
// CoinDrafts Core queries
const GET_GAMES = gql`
	query GetGames {
		games {
			gameId
			mode
			status
			createdAt
			playerCount
			maxPlayers
			winners
			entryFeeUsdc
		}
	}
`;

// CoinDrafts Core single game query
const GET_GAME = gql`
	query GetGame($gameId: String!) {
		game(gameId: $gameId) {
			gameId
			mode
			status
			createdAt
			playerCount
			maxPlayers
			winners
			entryFeeUsdc
		}
	}
`;

// CoinDrafts Core portfolios query
const GET_PORTFOLIOS = gql`
	query GetPortfolios($gameId: String!) {
		portfolios(gameId: $gameId) {
			playerAccount
			holdings {
				symbol
				allocationPercent
			}
			submittedAt
			status
		}
	}
`;

// CoinDrafts Core players query
const GET_PLAYERS = gql`
	query GetPlayers {
		players {
			account
			name
			stats {
				gamesPlayed
				gamesWon
			}
			totalEarningsUsdc
			tier
		}
	}
`;

// Traditional Leagues queries
const GET_TOURNAMENTS = gql`
	query GetTournaments {
		tournaments {
			id
			name
			tournamentType
			status
			entryFeeUsdc
			maxParticipants
			currentParticipants
			createdAt
		}
	}
`;

const GET_TOURNAMENT = gql`
	query GetTournament($id: String!) {
		tournament(id: $id) {
			id
			name
			tournamentType
			status
			entryFeeUsdc
			maxParticipants
			currentParticipants
			createdAt
			startPrices {
				cryptoId
				priceUsd
				timestamp
			}
			endPrices {
				cryptoId
				priceUsd
				timestamp
			}
		}
	}
`;

const GET_ACTIVE_TOURNAMENTS = gql`
	query GetActiveTournaments {
		activeTournaments {
			id
			name
			tournamentType
			status
			entryFeeUsdc
			maxParticipants
			currentParticipants
			createdAt
		}
	}
`;

const GET_TOURNAMENT_PARTICIPANTS = gql`
	query GetTournamentParticipants($tournamentId: String!) {
		tournamentParticipants(tournamentId: $tournamentId)
	}
`;

const GET_TOURNAMENT_RESULTS = gql`
	query GetTournamentResults($tournamentId: String!) {
		tournamentResults(tournamentId: $tournamentId)
	}
`;

const GET_TOURNAMENT_LEADERBOARD = gql`
	query GetTournamentLeaderboard($tournamentId: String!) {
		tournamentLeaderboard(tournamentId: $tournamentId) {
			rank
			playerAccount
			totalReturn
			winningAmount
		}
	}
`;

const GET_PLAYER_PORTFOLIO = gql`
	query GetPlayerPortfolio($tournamentId: String!, $playerAccount: String!) {
		playerPortfolio(tournamentId: $tournamentId, playerAccount: $playerAccount) {
			cryptoPicks
			strategyNotes
		}
	}
`;

// GraphQL Mutations - Based on ACTUAL deployed application schema
// CoinDrafts Core mutations (from CoinDraftsOperation enum)
const CREATE_GAME = gql`
	mutation CreateGame(
		$mode: String!
		$name: String!
		$max_players: Int!
		$entry_fee_usdc: Int!
		$duration_hours: Int!
	) {
		createGame(
			mode: $mode
			name: $name
			max_players: $max_players
			entry_fee_usdc: $entry_fee_usdc
			duration_hours: $duration_hours
		)
	}
`;

const REGISTER_PLAYER = gql`
	mutation RegisterPlayer($gameId: String!, $playerName: String!) {
		registerPlayer(gameId: $gameId, playerName: $playerName)
	}
`;

const SUBMIT_PORTFOLIO = gql`
	mutation SubmitPortfolio($gameId: String!, $cryptocurrencies: [String!]!) {
		submitPortfolio(gameId: $gameId, cryptocurrencies: $cryptocurrencies)
	}
`;

const START_GAME = gql`
	mutation StartGame($gameId: String!, $priceSnapshot: [PriceSnapshotInput!]!) {
		startGame(gameId: $gameId, priceSnapshot: $priceSnapshot)
	}
`;

const END_GAME = gql`
	mutation EndGame($gameId: String!, $priceSnapshot: [PriceSnapshotInput!]!) {
		endGame(gameId: $gameId, priceSnapshot: $priceSnapshot)
	}
`;

// Traditional Leagues mutations
const CREATE_TOURNAMENT = gql`
	mutation CreateTournament(
		$name: String!
		$entryFeeUsdc: String!
		$maxParticipants: Int!
		$tournamentType: TournamentType!
		$category: String!
	) {
		createTournament(
			name: $name
			entryFeeUsdc: $entryFeeUsdc
			maxParticipants: $maxParticipants
			tournamentType: $tournamentType
			category: $category
		)
	}
`;

const REGISTER_FOR_TOURNAMENT = gql`
	mutation RegisterForTournament($tournamentId: String!, $playerAccount: String!) {
		registerForTournament(tournamentId: $tournamentId, playerAccount: $playerAccount)
	}
`;

const START_TOURNAMENT = gql`
	mutation StartTournament($tournamentId: String!, $startPrices: [String!]!) {
		startTournament(tournamentId: $tournamentId, startPrices: $startPrices)
	}
`;

const END_TOURNAMENT = gql`
	mutation EndTournament($tournamentId: String!, $endPrices: [String!]!) {
		endTournament(tournamentId: $tournamentId, endPrices: $endPrices)
	}
`;

const ADVANCE_ROUND = gql`
	mutation AdvanceRound($tournamentId: String!) {
		advanceRound(tournamentId: $tournamentId)
	}
`;

// Service
class CoinDraftsService {
	// === GAME QUERIES ===
	async fetchGames(): Promise<Game[]> {
		const result = await coinDraftsClient.query<GamesQueryResult>({ query: GET_GAMES });
		return result.data?.games || [];
	}

	async fetchGame(gameId: string): Promise<Game | null> {
		const result = await coinDraftsClient.query<GameQueryResult>({
			query: GET_GAME,
			variables: { gameId },
			fetchPolicy: 'network-only'
		});

		return result.data?.game || null;
	}

	async fetchPlayers(): Promise<PlayerProfile[]> {
		const result = await coinDraftsClient.query<PlayersQueryResult>({
			query: GET_PLAYERS
		});
		return result.data?.players || [];
	}

	// Helper method to find a specific player by account/chain ID
	async fetchPlayerProfile(playerId: string): Promise<PlayerProfile | null> {
		const players = await this.fetchPlayers();
		return players.find((p) => p.account === playerId) || null;
	}

	// Helper method to get games where a specific player is registered
	async fetchPlayerGames(playerId: string): Promise<Game[]> {
		const allGames = await this.fetchGames();

		// Filter games by checking portfolios for player participation
		const playerGames: Game[] = [];

		for (const game of allGames) {
			const portfolios = await this.fetchPortfolios(game.gameId);
			const hasPlayerPortfolio = portfolios.some((p) => p.playerAccount === playerId);

			if (hasPlayerPortfolio) {
				playerGames.push(game);
			}
		}

		return playerGames;
	}

	async fetchPortfolios(gameId: string): Promise<Portfolio[]> {
		try {
			const result = await coinDraftsClient.query<PortfoliosQueryResult>({
				query: GET_PORTFOLIOS,
				variables: { gameId },
				fetchPolicy: 'network-only'
			});

			return result.data?.portfolios || [];
		} catch (error) {
			console.error('[DEBUG fetchPortfolios] Query failed:', error);
			return [];
		}
	}

	// === TOURNAMENT QUERIES ===
	async fetchTournaments(): Promise<Tournament[]> {
		const result = await tradLeaguesClient.query<TournamentsQueryResult>({
			query: GET_TOURNAMENTS
		});
		return result.data?.tournaments || [];
	}

	async fetchTournament(id: string): Promise<Tournament | null> {
		const result = await tradLeaguesClient.query<TournamentQueryResult>({
			query: GET_TOURNAMENT,
			variables: { id }
		});
		return result.data?.tournament || null;
	}

	async fetchActiveTournaments(): Promise<Tournament[]> {
		const result = await tradLeaguesClient.query<ActiveTournamentsQueryResult>({
			query: GET_ACTIVE_TOURNAMENTS
		});
		return result.data?.activeTournaments || [];
	}

	async fetchTournamentParticipants(tournamentId: string): Promise<string[]> {
		const result = await tradLeaguesClient.query<TournamentParticipantsQueryResult>({
			query: GET_TOURNAMENT_PARTICIPANTS,
			variables: { tournamentId }
		});
		return result.data?.tournamentParticipants || [];
	}

	async fetchTournamentResults(tournamentId: string): Promise<string[]> {
		const result = await tradLeaguesClient.query<TournamentResultsQueryResult>({
			query: GET_TOURNAMENT_RESULTS,
			variables: { tournamentId },
			fetchPolicy: 'network-only'
		});
		return result.data?.tournamentResults || [];
	}

	async fetchPlayerPortfolio(
		tournamentId: string,
		playerAccount: string
	): Promise<TournamentPortfolio | null> {
		const result = await tradLeaguesClient.query<TournamentPortfolioQueryResult>({
			query: GET_PLAYER_PORTFOLIO,
			variables: { tournamentId, playerAccount }
		});
		return result.data?.playerPortfolio || null;
	}

	async fetchTournamentLeaderboard(tournamentId: string): Promise<LeaderboardEntry[]> {
		const result = await tradLeaguesClient.query<{ tournamentLeaderboard: LeaderboardEntry[] }>({
			query: GET_TOURNAMENT_LEADERBOARD,
			variables: { tournamentId },
			fetchPolicy: 'network-only'
		});
		return result.data?.tournamentLeaderboard || [];
	}

	async createGame(
		mode: string,
		name: string,
		maxPlayers: number,
		entryFeeUsdc: number,
		durationHours: number
	): Promise<MutationResult> {
		try {
			const result = await coinDraftsClient.mutate({
				mutation: CREATE_GAME,
				variables: {
					mode,
					name,
					max_players: maxPlayers,
					entry_fee_usdc: entryFeeUsdc,
					duration_hours: durationHours
				}
			});

			if (result.error) {
				console.error('GraphQL Error:', result.error);
				return { success: false };
			}

			// Check if we got the game ID directly as a string
			const success = !!(result.data && typeof result.data === 'string');

			return { success };
		} catch (error) {
			console.error('Game creation error:', error);
			return { success: false };
		}
	}

	async createTournament(
		name: string,
		entryFeeUsdc: number,
		maxParticipants: number,
		tournamentType: string,
		category: string = 'ALL_CATEGORIES'
	): Promise<MutationResult> {
		try {
			const result = await tradLeaguesClient.mutate({
				mutation: CREATE_TOURNAMENT,
				variables: {
					name,
					entryFeeUsdc: entryFeeUsdc.toString(), // Convert to string as expected by backend
					maxParticipants,
					tournamentType,
					category
				}
			});

			if (result.error) {
				console.error('GraphQL Error:', result.error);
				return { success: false };
			}

			// Check if we got the tournament ID directly as a string
			const success = !!(result.data && typeof result.data === 'string');

			return { success };
		} catch (error) {
			console.error('Tournament creation error:', error);
			return { success: false };
		}
	}

	async registerPlayer(gameId: string, playerName: string): Promise<MutationResult> {
		try {
			const result = await coinDraftsClient.mutate({
				mutation: REGISTER_PLAYER,
				variables: { gameId, playerName }
			});

			const success = !result.error;
			return { success };
		} catch (error) {
			console.error('Player registration error:', error);
			return { success: false };
		}
	}

	async registerForTournament(
		tournamentId: string,
		playerAccount: string
	): Promise<MutationResult> {
		try {
			const result = await tradLeaguesClient.mutate({
				mutation: REGISTER_FOR_TOURNAMENT,
				variables: { tournamentId, playerAccount }
			});

			const success = !!(result.data && typeof result.data === 'string');

			return { success };
		} catch (error) {
			console.error('Tournament registration error:', error);
			return { success: false };
		}
	}

	async fetchLeaderboard(tournamentId: string): Promise<LeaderboardEntry[]> {
		try {
			const result = await tradLeaguesClient.query<TournamentLeaderboardQueryResult>({
				query: GET_TOURNAMENT_LEADERBOARD,
				variables: { tournamentId }
			});

			return result.data?.tournamentLeaderboard || [];
		} catch (error) {
			console.error('Leaderboard fetch error:', error);
			return [];
		}
	}

	async submitPortfolio(gameId: string, cryptocurrencies: string[]): Promise<MutationResult> {
		try {
			const result = await coinDraftsClient.mutate({
				mutation: SUBMIT_PORTFOLIO,
				variables: { gameId, cryptocurrencies }
			});

			const success = !result.error;
			return { success };
		} catch (error) {
			console.error('Portfolio submission error:', error);
			return { success: false };
		}
	}

	async startGame(gameId: string, priceSnapshot: PriceSnapshotInput[]): Promise<MutationResult> {
		try {
			const formattedSnapshot = priceSnapshot.map((s) => ({
				cryptoId: s.cryptoId,
				priceUsd: Math.floor(s.priceUsd),
				timestamp: Math.floor(s.timestamp)
			}));

			const result = await coinDraftsClient.mutate({
				mutation: START_GAME,
				variables: {
					gameId,
					priceSnapshot: formattedSnapshot
				}
			});

			if (result.error) {
				console.error('[startGame] result.error:', result.error);
			}

			if (!result.data) {
				console.error('[startGame] No data in result');
			}

			const success = !result.error && !!result.data;

			return { success };
		} catch (error) {
			console.error('[startGame] Exception:', error);
			return { success: false };
		}
	}

	async endGame(gameId: string, priceSnapshot: PriceSnapshotInput[]): Promise<MutationResult> {
		try {
			const result = await coinDraftsClient.mutate({
				mutation: END_GAME,
				variables: {
					gameId,
					priceSnapshot: priceSnapshot.map((s) => ({
						cryptoId: s.cryptoId,
						priceUsd: Math.floor(s.priceUsd),
						timestamp: Math.floor(s.timestamp)
					}))
				}
			});
			const success = !result.error;
			return { success };
		} catch (error) {
			console.error('End game error:', error);
			return { success: false };
		}
	}

	async startTournament(
		tournamentId: string,
		startPrices: PriceSnapshotInput[]
	): Promise<MutationResult> {
		try {
			// Convert PriceSnapshotInput to stringified JSON array (backend expects Vec<String>)
			const priceStrings = startPrices.map((p) =>
				JSON.stringify({
					crypto_id: p.cryptoId,
					price_usd: p.priceUsd,
					timestamp: p.timestamp
				})
			);

			const result = await tradLeaguesClient.mutate({
				mutation: START_TOURNAMENT,
				variables: { tournamentId, startPrices: priceStrings }
			});

			const success = !!(result.data && typeof result.data === 'string');

			return { success };
		} catch (error) {
			console.error('Start tournament error:', error);
			return { success: false };
		}
	}

	async endTournament(
		tournamentId: string,
		endPrices: PriceSnapshotInput[]
	): Promise<MutationResult> {
		try {
			// Convert PriceSnapshotInput to stringified JSON array (backend expects Vec<String>)
			const priceStrings = endPrices.map((p) =>
				JSON.stringify({
					crypto_id: p.cryptoId,
					price_usd: p.priceUsd,
					timestamp: p.timestamp
				})
			);

			const result = await tradLeaguesClient.mutate({
				mutation: END_TOURNAMENT,
				variables: { tournamentId, endPrices: priceStrings }
			});

			const success = !!(result.data && typeof result.data === 'string');

			return { success };
		} catch (error) {
			console.error('End tournament error:', error);
			return { success: false };
		}
	}

	async advanceRound(tournamentId: string): Promise<MutationResult> {
		try {
			const result = await tradLeaguesClient.mutate({
				mutation: ADVANCE_ROUND,
				variables: { tournamentId }
			});

			const success = !!(result.data && typeof result.data === 'string');

			return { success };
		} catch (error) {
			console.error('Advance round error:', error);
			return { success: false };
		}
	}
}

export const coinDraftsService = new CoinDraftsService();
export default coinDraftsService;
