import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';

// CoinDrafts Core application endpoint
const COINDRAFTS_CORE_URI =
	'http://localhost:8080/chains/5458ff78b91cf0522b84f76a49baffaf69656be042eafc19365c3f7157a7b5d0/applications/c59acaa0b0fb2cb0adc02ecb77767d368cf36c33fb1f1ffa74bb8755735a349f';

// Traditional Leagues application endpoint
const TRADITIONAL_LEAGUES_URI =
	'http://localhost:8080/chains/5458ff78b91cf0522b84f76a49baffaf69656be042eafc19365c3f7157a7b5d0/applications/2cdcd8ada23c84bad4d71145ed855e33931be4f81d16c27d764ceee54bd23fd4';

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
		$portfolio: TournamentPortfolioInput!
	) {
		operation(
			input: {
				SubmitPortfolio: { tournament_id: $tournamentId, round: $round, portfolio: $portfolio }
			}
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
