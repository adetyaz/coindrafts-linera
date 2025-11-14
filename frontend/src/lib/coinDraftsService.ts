import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';

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

// GraphQL Response Types
interface GamesQueryResult {
	games: Game[];
}

interface TournamentsQueryResult {
	tournaments: Tournament[];
}

// Mutation Response Types
// Removed fake mutation result interfaces - using direct success checking instead

// GraphQL Clients
const coinDraftsClient = new ApolloClient({
	link: new HttpLink({
		uri: 'http://localhost:8080/chains/5458ff78b91cf0522b84f76a49baffaf69656be042eafc19365c3f7157a7b5d0/applications/c59acaa0b0fb2cb0adc02ecb77767d368cf36c33fb1f1ffa74bb8755735a349f'
	}),
	cache: new InMemoryCache(),
	defaultOptions: {
		query: { errorPolicy: 'all' },
		mutate: { errorPolicy: 'ignore', fetchPolicy: 'no-cache' }
	}
});

const tradLeaguesClient = new ApolloClient({
	link: new HttpLink({
		uri: 'http://localhost:8080/chains/5458ff78b91cf0522b84f76a49baffaf69656be042eafc19365c3f7157a7b5d0/applications/2cdcd8ada23c84bad4d71145ed855e33931be4f81d16c27d764ceee54bd23fd4'
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
	async fetchGames(): Promise<Game[]> {
		const result = await coinDraftsClient.query<GamesQueryResult>({ query: GET_GAMES });
		return result.data?.games || [];
	}

	async fetchTournaments(): Promise<Tournament[]> {
		const result = await tradLeaguesClient.query<TournamentsQueryResult>({
			query: GET_TOURNAMENTS
		});
		return result.data?.tournaments || [];
	}

	async createGame(mode: string): Promise<MutationResult> {
		const result = await coinDraftsClient.mutate({
			mutation: CREATE_GAME,
			variables: { mode }
		});
		return { success: !!result.data };
	}

	async createTournament(
		name: string,
		entryFeeUsdc: number,
		maxParticipants: number,
		tournamentType: string
	): Promise<MutationResult> {
		const result = await tradLeaguesClient.mutate({
			mutation: CREATE_TOURNAMENT,
			variables: { 
				name, 
				entryFeeUsdc: entryFeeUsdc.toString(), // Convert to string as expected by backend
				maxParticipants, 
				tournamentType 
			}
		});
		return { success: !!result.data };
	}

	async registerPlayer(gameId: string, playerName: string): Promise<MutationResult> {
		const result = await coinDraftsClient.mutate({
			mutation: REGISTER_PLAYER,
			variables: { gameId, playerName }
		});
		return { success: !!result.data };
	}

	async registerForTournament(
		tournamentId: string,
		playerAccount: string
	): Promise<MutationResult> {
		const result = await tradLeaguesClient.mutate({
			mutation: REGISTER_FOR_TOURNAMENT,
			variables: { tournamentId, playerAccount }
		});
		return { success: !!result.data };
	}

	async submitPortfolio(gameId: string, cryptocurrencies: string[]): Promise<MutationResult> {
		const result = await coinDraftsClient.mutate({
			mutation: SUBMIT_PORTFOLIO,
			variables: { gameId, cryptocurrencies }
		});
		return { success: !!result.data };
	}

}

export const coinDraftsService = new CoinDraftsService();
export type { Game, Tournament, MutationResult };
