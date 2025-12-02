import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';

// CoinDrafts Core application endpoint
const COINDRAFTS_CORE_URI =
	'http://localhost:8080/chains/3b7dc35ad9989e5a049084fe4b0a995905ab65bd98a60e89f9b3576fb2ce125e/applications/291a8797a591dee08a8cad1420a740520577f88d611548ff697df2eb14ed73e8';

// Traditional Leagues application endpoint
const TRADITIONAL_LEAGUES_URI =
	'http://localhost:8080/chains/3b7dc35ad9989e5a049084fe4b0a995905ab65bd98a60e89f9b3576fb2ce125e/applications/39d51c08f0cc40daabcdda83e974c3e9ddfc3656c7298161a2069a4f856ae0f2';

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
		operation(input: { CreateGame: { mode: $mode } })
	}
`;

export const REGISTER_PLAYER = gql`
	mutation RegisterPlayer($gameId: String!, $playerName: String!) {
		operation(input: { RegisterPlayer: { game_id: $gameId, player_name: $playerName } })
	}
`;

export const SUBMIT_PORTFOLIO = gql`
	mutation SubmitPortfolio($gameId: String!, $cryptocurrencies: [String!]!) {
		operation(input: { SubmitPortfolio: { game_id: $gameId, cryptocurrencies: $cryptocurrencies } })
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
		$entryFeeUsdc: Int!
		$maxParticipants: Int!
		$tournamentType: String!
	) {
		operation(
			input: {
				CreateTournament: {
					name: $name
					entry_fee_usdc: $entryFeeUsdc
					max_participants: $maxParticipants
					tournament_type: $tournamentType
				}
			}
		)
	}
`;

export const REGISTER_FOR_TOURNAMENT = gql`
	mutation RegisterForTournament($tournamentId: String!, $playerAccount: String!) {
		operation(
			input: {
				RegisterForTournament: { tournament_id: $tournamentId, player_account: $playerAccount }
			}
		)
	}
`;

export const SUBMIT_TOURNAMENT_PORTFOLIO = gql`
	mutation SubmitTournamentPortfolio(
		$tournamentId: String!
		$round: Int!
		$cryptoPicks: [String!]!
		$strategyNotes: String
	) {
		submitPortfolio(
			tournamentId: $tournamentId
			round: $round
			cryptoPicks: $cryptoPicks
			strategyNotes: $strategyNotes
		)
	}
`;

export const ADVANCE_ROUND = gql`
	mutation AdvanceRound($tournamentId: String!) {
		operation(input: { AdvanceRound: { tournament_id: $tournamentId } })
	}
`;

export const COMPLETE_TOURNAMENT = gql`
	mutation CompleteTournament($tournamentId: String!) {
		operation(input: { CompleteTournament: { tournament_id: $tournamentId } })
	}
`;
