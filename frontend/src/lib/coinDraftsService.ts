import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import {
	PUBLIC_COINDRAFTS_CORE_APP_ID,
	PUBLIC_TRADITIONAL_LEAGUES_APP_ID
} from '$env/static/public';

// Types
interface Game {
	gameId: string;
	mode: string;
	status: string;
	createdAt: number;
	playerCount: number;
	maxPlayers: number;
}

interface Tournament {
	id: string;
	name: string;
	tournamentType: string;
	status: string;
	entryFeeUsdc: number;
	maxParticipants: number;
	currentParticipants: number;
	currentRound: number;
	maxRounds: number;
	createdAt: number;
}

interface MutationResult {
	success: boolean;
}

// Player and Portfolio types
interface PlayerProfile {
	playerId: string;
	playerName: string;
	stats: {
		gamesPlayed: number;
		gamesWon: number;
		totalEarnings: number;
	};
	tier: string;
}

interface Portfolio {
	playerId: string;
	cryptocurrencies: string[];
	submittedAt: number;
	status: string;
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

// Mutation Response Types
// Removed fake mutation result interfaces - using direct success checking instead

// Configuration - SvelteKit environment variables
const LINERA_GRAPHQL_BASE = 'http://localhost:8080';
const DEFAULT_CHAIN_ID = '3b7dc35ad9989e5a049084fe4b0a995905ab65bd98a60e89f9b3576fb2ce125e';

// Application IDs - using SvelteKit environment variables with fallbacks
const COINDRAFTS_CORE_APP_ID =
	PUBLIC_COINDRAFTS_CORE_APP_ID ||
	'291a8797a591dee08a8cad1420a740520577f88d611548ff697df2eb14ed73e8';
const TRADITIONAL_LEAGUES_APP_ID =
	PUBLIC_TRADITIONAL_LEAGUES_APP_ID ||
	'39d51c08f0cc40daabcdda83e974c3e9ddfc3656c7298161a2069a4f856ae0f2';

// GraphQL Clients
const coinDraftsClient = new ApolloClient({
	link: new HttpLink({
		uri: `${LINERA_GRAPHQL_BASE}/chains/${DEFAULT_CHAIN_ID}/applications/${COINDRAFTS_CORE_APP_ID}`
	}),
	cache: new InMemoryCache(),
	defaultOptions: {
		query: { errorPolicy: 'all' },
		mutate: { errorPolicy: 'ignore', fetchPolicy: 'no-cache' }
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
		}
	}
`;

// CoinDrafts Core portfolios query
const GET_PORTFOLIOS = gql`
	query GetPortfolios($gameId: String!) {
		portfolios(gameId: $gameId) {
			playerId
			cryptocurrencies
			submittedAt
			status
		}
	}
`;

// CoinDrafts Core players query
const GET_PLAYERS = gql`
	query GetPlayers {
		players {
			playerId
			playerName
			stats {
				gamesPlayed
				gamesWon
				totalEarnings
			}
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
			currentRound
			maxRounds
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
			currentRound
			maxRounds
			createdAt
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
			currentRound
			maxRounds
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

// GraphQL Mutations - Based on ACTUAL deployed application schema
// CoinDrafts Core mutations (from CoinDraftsOperation enum)
const CREATE_GAME = gql`
	mutation CreateGame($mode: String!) {
		createGame(mode: $mode)
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

// Traditional Leagues mutations
const CREATE_TOURNAMENT = gql`
	mutation CreateTournament(
		$name: String!
		$entryFeeUsdc: String!
		$maxParticipants: Int!
		$tournamentType: TournamentType!
	) {
		createTournament(
			name: $name
			entryFeeUsdc: $entryFeeUsdc
			maxParticipants: $maxParticipants
			tournamentType: $tournamentType
		)
	}
`;

const REGISTER_FOR_TOURNAMENT = gql`
	mutation RegisterForTournament($tournamentId: String!, $playerAccount: String!) {
		registerForTournament(tournamentId: $tournamentId, playerAccount: $playerAccount)
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
			variables: { gameId }
		});
		return result.data?.game || null;
	}

	async fetchPlayers(): Promise<PlayerProfile[]> {
		const result = await coinDraftsClient.query<PlayersQueryResult>({
			query: GET_PLAYERS
		});
		return result.data?.players || [];
	}

	async fetchPortfolios(gameId: string): Promise<Portfolio[]> {
		const result = await coinDraftsClient.query<PortfoliosQueryResult>({
			query: GET_PORTFOLIOS,
			variables: { gameId }
		});
		return result.data?.portfolios || [];
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
			variables: { tournamentId }
		});
		return result.data?.tournamentResults || [];
	}

	async createGame(mode: string): Promise<MutationResult> {
		try {
			console.log('Sending game creation request to:', coinDraftsClient.link);
			console.log('Variables:', { mode });

			const result = await coinDraftsClient.mutate({
				mutation: CREATE_GAME,
				variables: { mode }
			});

			console.log('GraphQL Result:', result);
			console.log('Result data:', result.data);
			console.log('Result error:', result.error);

			if (result.error) {
				console.error('GraphQL Error:', result.error);
				return { success: false };
			}

			// Check if we got the game ID directly as a string
			const success = !!(result.data && typeof result.data === 'string');
			console.log('Game creation success:', success, 'Game ID:', result.data);

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
		tournamentType: string
	): Promise<MutationResult> {
		try {
			console.log('Sending tournament creation request to:', tradLeaguesClient.link);
			console.log('Variables:', {
				name,
				entryFeeUsdc: entryFeeUsdc.toString(),
				maxParticipants,
				tournamentType
			});

			const result = await tradLeaguesClient.mutate({
				mutation: CREATE_TOURNAMENT,
				variables: {
					name,
					entryFeeUsdc: entryFeeUsdc.toString(), // Convert to string as expected by backend
					maxParticipants,
					tournamentType
				}
			});

			console.log('GraphQL Result:', result);
			console.log('Result data:', result.data);
			console.log('Result error:', result.error);

			if (result.error) {
				console.error('GraphQL Error:', result.error);
				return { success: false };
			}

			// Check if we got the tournament ID directly as a string
			const success = !!(result.data && typeof result.data === 'string');
			console.log('Tournament creation success:', success, 'Tournament ID:', result.data);

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

			const success = !!(result.data && typeof result.data === 'string');
			console.log('Player registration success:', success, 'Transaction ID:', result.data);

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
			console.log('Tournament registration success:', success, 'Transaction ID:', result.data);

			return { success };
		} catch (error) {
			console.error('Tournament registration error:', error);
			return { success: false };
		}
	}

	async submitPortfolio(gameId: string, cryptocurrencies: string[]): Promise<MutationResult> {
		try {
			const result = await coinDraftsClient.mutate({
				mutation: SUBMIT_PORTFOLIO,
				variables: { gameId, cryptocurrencies }
			});

			const success = !!(result.data && typeof result.data === 'string');
			console.log('Portfolio submission success:', success, 'Transaction ID:', result.data);

			return { success };
		} catch (error) {
			console.error('Portfolio submission error:', error);
			return { success: false };
		}
	}
}

export const coinDraftsService = new CoinDraftsService();
export type { Game, Tournament, MutationResult, PlayerProfile, Portfolio };
