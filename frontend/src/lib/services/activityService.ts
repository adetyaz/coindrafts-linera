/**
 * Activity Service - Frontend-only activity feed
 * Derives activity events from existing game/tournament data
 */

export type ActivityEventType =
	| 'PLAYER_JOINED'
	| 'PORTFOLIO_SUBMITTED'
	| 'GAME_STARTED'
	| 'GAME_ENDED'
	| 'TOURNAMENT_CREATED'
	| 'TOURNAMENT_STARTED'
	| 'TOURNAMENT_ENDED';

export interface ActivityEvent {
	id: string;
	type: ActivityEventType;
	timestamp: Date;
	description: string;
	playerAccount?: string;
}

/**
 * Generate activity events from game data
 */
export function generateGameActivity(
	game: { gameId: string; createdAt?: number | string; status: string; playerCount?: number },
	portfolios: Array<{ playerAccount: string; holdings?: Array<{ symbol: string }> }>
): ActivityEvent[] {
	const events: ActivityEvent[] = [];

	// Game created event
	if (game.createdAt) {
		events.push({
			id: `game-created-${game.gameId}`,
			type: 'TOURNAMENT_CREATED',
			timestamp: parseTimestamp(game.createdAt),
			description: 'Game created'
		});
	}

	// Player joined events (from portfolios)
	portfolios.forEach((portfolio, index) => {
		events.push({
			id: `player-joined-${portfolio.playerAccount}-${index}`,
			type: 'PLAYER_JOINED',
			timestamp: parseTimestamp(game.createdAt), // Approximate, no exact timestamp
			description: 'Player joined',
			playerAccount: portfolio.playerAccount
		});

		events.push({
			id: `portfolio-submitted-${portfolio.playerAccount}-${index}`,
			type: 'PORTFOLIO_SUBMITTED',
			timestamp: parseTimestamp(game.createdAt), // Approximate
			description: `Portfolio submitted (${portfolio.holdings?.length || 0} coins)`,
			playerAccount: portfolio.playerAccount
		});
	});

	// Game started event
	if (
		game.status === 'Active' ||
		game.status === 'ACTIVE' ||
		game.status === 'Completed' ||
		game.status === 'COMPLETED'
	) {
		events.push({
			id: `game-started-${game.gameId}`,
			type: 'GAME_STARTED',
			timestamp: parseTimestamp(game.createdAt), // Approximate
			description: `Game started with ${portfolios.length} players`
		});
	}

	// Game ended event
	if (game.status === 'Completed' || game.status === 'COMPLETED') {
		events.push({
			id: `game-ended-${game.gameId}`,
			type: 'GAME_ENDED',
			timestamp: parseTimestamp(game.createdAt), // Approximate
			description: 'Game completed'
		});
	}

	// Sort by timestamp (newest first)
	return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Generate activity events from tournament data
 */
export function generateTournamentActivity(
	tournament: { id: string; name: string; status: string },
	participants: string[],
	portfolios: Map<string, { cryptoPicks?: string[] }>
): ActivityEvent[] {
	const events: ActivityEvent[] = [];

	// Tournament created event
	events.push({
		id: `tournament-created-${tournament.id}`,
		type: 'TOURNAMENT_CREATED',
		timestamp: new Date(), // No timestamp in tournament data currently
		description: `Tournament "${tournament.name}" created`
	});

	// Participant events
	participants.forEach((participant, index) => {
		events.push({
			id: `player-joined-${participant}-${index}`,
			type: 'PLAYER_JOINED',
			timestamp: new Date(), // Approximate
			description: 'Player joined tournament',
			playerAccount: participant
		});

		const portfolio = portfolios.get(participant);
		if (portfolio) {
			events.push({
				id: `portfolio-submitted-${participant}-${index}`,
				type: 'PORTFOLIO_SUBMITTED',
				timestamp: new Date(), // Approximate
				description: `Portfolio submitted (${portfolio.cryptoPicks?.length || 0} coins)`,
				playerAccount: participant
			});
		}
	});

	// Tournament started event
	if (tournament.status === 'InProgress' || tournament.status.toLowerCase().includes('progress')) {
		events.push({
			id: `tournament-started-${tournament.id}`,
			type: 'TOURNAMENT_STARTED',
			timestamp: new Date(), // Approximate
			description: `Tournament started with ${participants.length} players`
		});
	}

	// Tournament ended event
	if (tournament.status === 'Completed' || tournament.status.toLowerCase().includes('completed')) {
		events.push({
			id: `tournament-ended-${tournament.id}`,
			type: 'TOURNAMENT_ENDED',
			timestamp: new Date(), // Approximate
			description: 'Tournament completed'
		});
	}

	// Sort by timestamp (newest first)
	return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Parse Linera nanosecond timestamp to Date
 */
function parseTimestamp(timestamp: number | string | undefined): Date {
	if (!timestamp) return new Date();

	const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
	if (isNaN(ts)) return new Date();

	// Try different timestamp formats (Linera uses nanoseconds)
	const formats = [
		ts / 1000000000, // nanoseconds (most likely)
		ts / 1000000, // microseconds
		ts / 1000, // milliseconds
		ts // seconds
	];

	for (const converted of formats) {
		const date = new Date(converted);
		if (date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
			return date;
		}
	}

	return new Date();
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffSec < 60) return 'Just now';
	if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
	if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
	if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

	return date.toLocaleDateString();
}

/**
 * Truncate account address for display
 */
export function truncateAccount(account: string): string {
	if (account.length <= 12) return account;
	return `${account.slice(0, 6)}...${account.slice(-4)}`;
}
