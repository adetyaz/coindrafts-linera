import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { PUBLIC_DEFAULT_CHAIN_ID, PUBLIC_COINDRAFTS_CORE_APP_ID } from '$env/static/public';

const profileClient = new ApolloClient({
	link: new HttpLink({
		uri: `http://localhost:8081/chains/${PUBLIC_DEFAULT_CHAIN_ID}/applications/${PUBLIC_COINDRAFTS_CORE_APP_ID}`
	}),
	cache: new InMemoryCache()
});

// Types
export interface Achievement {
	id: string;
	achievementType:
		| 'FirstWin'
		| 'Play10Games'
		| 'Play50Games'
		| 'WinStreak3'
		| 'PerfectPortfolio'
		| 'RisingStar'
		| 'Legend';
	unlockedAt: number;
	gameId?: string;
}

export interface GameResult {
	gameId: string;
	rank: number;
	portfolioReturn: number;
	prizeWon: number;
	playedAt: number;
}

export interface PlayerStats {
	account: string;
	name: string;
	totalGamesPlayed: number;
	totalWins: number;
	totalEarningsUsdc: number;
	currentTier: string;
	achievementsUnlocked: Achievement[];
	recentGames: GameResult[];
}

export interface LeaderboardEntry {
	rank: number;
	playerAccount: string;
	playerName: string;
	totalGamesPlayed: number;
	totalWins: number;
	winRate: number;
	totalEarningsUsdc: number;
	currentTier: string;
}

// Queries
const GET_PLAYER_PROFILE = gql`
	query GetPlayerProfile($account: String!) {
		playerProfile(account: $account) {
			account
			name
			totalGamesPlayed
			totalWins
			totalEarningsUsdc
			currentTier
			achievementsUnlocked {
				id
				achievementType
				unlockedAt
				gameId
			}
			recentGames {
				gameId
				rank
				portfolioReturn
				prizeWon
				playedAt
			}
		}
	}
`;

const GET_PLAYER_ACHIEVEMENTS = gql`
	query GetPlayerAchievements($account: String!) {
		playerAchievements(account: $account) {
			id
			achievementType
			unlockedAt
			gameId
		}
	}
`;

const GET_PLAYER_GAME_HISTORY = gql`
	query GetPlayerGameHistory($account: String!, $limit: Int, $offset: Int) {
		playerGameHistory(account: $account, limit: $limit, offset: $offset) {
			gameId
			rank
			portfolioReturn
			prizeWon
			playedAt
		}
	}
`;

const GET_LEADERBOARD = gql`
	query GetLeaderboard($tierFilter: PlayerTier, $limit: Int) {
		leaderboard(tierFilter: $tierFilter, limit: $limit) {
			rank
			playerAccount
			playerName
			totalGamesPlayed
			totalWins
			winRate
			totalEarningsUsdc
			currentTier
		}
	}
`;

// Service functions
export async function fetchPlayerProfile(account: string): Promise<PlayerStats | null> {
	try {
		const { data } = await profileClient.query<{ playerProfile: PlayerStats }>({
			query: GET_PLAYER_PROFILE,
			variables: { account },
			fetchPolicy: 'network-only'
		});
		return data?.playerProfile || null;
	} catch (error) {
		console.error('Error fetching player profile:', error);
		return null;
	}
}

export async function fetchPlayerAchievements(account: string): Promise<Achievement[]> {
	try {
		const { data } = await profileClient.query<{ playerAchievements: Achievement[] }>({
			query: GET_PLAYER_ACHIEVEMENTS,
			variables: { account },
			fetchPolicy: 'network-only'
		});
		return data?.playerAchievements || [];
	} catch (error) {
		console.error('Error fetching achievements:', error);
		return [];
	}
}

export async function fetchPlayerGameHistory(
	account: string,
	limit: number = 20,
	offset: number = 0
): Promise<GameResult[]> {
	try {
		const { data } = await profileClient.query<{ playerGameHistory: GameResult[] }>({
			query: GET_PLAYER_GAME_HISTORY,
			variables: { account, limit, offset },
			fetchPolicy: 'network-only'
		});
		return data?.playerGameHistory || [];
	} catch (error) {
		console.error('Error fetching game history:', error);
		return [];
	}
}

export async function fetchLeaderboard(
	tierFilter?: string,
	limit: number = 100
): Promise<LeaderboardEntry[]> {
	try {
		const { data } = await profileClient.query<{ leaderboard: LeaderboardEntry[] }>({
			query: GET_LEADERBOARD,
			variables: { tierFilter, limit },
			fetchPolicy: 'network-only'
		});
		return data?.leaderboard || [];
	} catch (error) {
		console.error('Error fetching leaderboard:', error);
		return [];
	}
}
