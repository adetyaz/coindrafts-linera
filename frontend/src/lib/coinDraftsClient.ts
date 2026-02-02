import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import {
	PUBLIC_COINDRAFTS_CORE_APP_ID,
	PUBLIC_TRADITIONAL_LEAGUES_APP_ID,
	PUBLIC_DEFAULT_CHAIN_ID,
	PUBLIC_ADMIN_CHAIN_ID
} from '$env/static/public';

// CoinDrafts Core application endpoint - PORT 8081 for GraphQL!
const COINDRAFTS_CORE_URI = `http://localhost:8081/chains/${PUBLIC_ADMIN_CHAIN_ID}/applications/${PUBLIC_COINDRAFTS_CORE_APP_ID}`;

// Traditional Leagues application endpoint - Use admin chain for reliable GraphQL access
const TRADITIONAL_LEAGUES_URI = `http://localhost:8081/chains/${PUBLIC_ADMIN_CHAIN_ID}/applications/${PUBLIC_TRADITIONAL_LEAGUES_APP_ID}`;

// CoinDrafts Core client
export const coinDraftsClient = new ApolloClient({
	link: new HttpLink({ uri: COINDRAFTS_CORE_URI }),
	cache: new InMemoryCache({
		typePolicies: {
			Mutation: {
				fields: {
					createGame: { merge: false },
					registerPlayer: { merge: false },
					submitPortfolio: { merge: false }
				}
			}
		}
	}),
	defaultOptions: {
		watchQuery: { errorPolicy: 'all' },
		query: { errorPolicy: 'all' },
		mutate: { errorPolicy: 'ignore', fetchPolicy: 'no-cache' }
	}
});

// Traditional Leagues client
export const tradLeaguesClient = new ApolloClient({
	link: new HttpLink({ uri: TRADITIONAL_LEAGUES_URI }),
	cache: new InMemoryCache({
		typePolicies: {
			Mutation: {
				fields: {
					createTournament: { merge: false },
					registerForTournament: { merge: false },
					submitPortfolio: { merge: false },
					advanceRound: { merge: false },
					completeTournament: { merge: false }
				}
			}
		}
	}),
	defaultOptions: {
		watchQuery: { errorPolicy: 'all' },
		query: { errorPolicy: 'all' },
		mutate: { errorPolicy: 'ignore', fetchPolicy: 'no-cache' }
	}
});

// CoinDrafts Core GraphQL queries and mutations
export const GET_GAMES = gql`
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

export const CREATE_GAME = gql`
	mutation CreateGame($mode: String!) {
		createGame(mode: $mode)
	}
`;

export const REGISTER_PLAYER = gql`
	mutation RegisterPlayer($gameId: String!, $playerName: String!) {
		registerPlayer(gameId: $gameId, playerName: $playerName)
	}
`;

export const SUBMIT_PORTFOLIO = gql`
	mutation SubmitPortfolio($gameId: String!, $cryptocurrencies: [String!]!) {
		submitPortfolio(gameId: $gameId, cryptocurrencies: $cryptocurrencies)
	}
`;

export const GET_TOURNAMENT_LEADERBOARD = gql`
	query GetTournamentLeaderboard($tournamentId: String!) {
		tournamentLeaderboard(tournamentId: $tournamentId) {
			rank
			playerAccount
			totalReturn
			winningAmount
		}
	}
`;

// Traditional Leagues GraphQL queries and mutations
export const GET_TOURNAMENTS = gql`
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
			startedAt
			completedAt
		}
	}
`;

export const CREATE_TOURNAMENT = gql`
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

export const REGISTER_FOR_TOURNAMENT = gql`
	mutation RegisterForTournament($tournamentId: String!, $playerAccount: String!) {
		registerForTournament(tournamentId: $tournamentId, playerAccount: $playerAccount)
	}
`;

export const SUBMIT_TOURNAMENT_PORTFOLIO = gql`
	mutation SubmitTournamentPortfolio(
		$tournamentId: String!
		$playerAccount: String!
		$cryptoPicks: [String!]!
		$strategyNotes: String
	) {
		submitPortfolioForAccount(
			tournamentId: $tournamentId
			playerAccount: $playerAccount
			cryptoPicks: $cryptoPicks
			strategyNotes: $strategyNotes
		)
	}
`;

export const ADVANCE_ROUND = gql`
	mutation AdvanceRound($tournamentId: String!) {
		advanceRound(tournamentId: $tournamentId)
	}
`;

export const COMPLETE_TOURNAMENT = gql`
	mutation CompleteTournament($tournamentId: String!) {
		completeTournament(tournamentId: $tournamentId)
	}
`;
