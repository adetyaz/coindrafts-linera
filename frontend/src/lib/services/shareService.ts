import type { Game, Tournament } from '$lib/coinDraftsService';

export interface ShareOptions {
	title: string;
	text: string;
	url: string;
}

/**
 * Share to Twitter using Twitter Web Intent
 */
export function shareToTwitter(text: string, url: string): void {
	const tweetText = encodeURIComponent(text);
	const tweetUrl = encodeURIComponent(url);
	const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`;
	window.open(twitterUrl, '_blank', 'width=550,height=420');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (err) {
		console.error('Failed to copy to clipboard:', err);
		// Fallback for older browsers
		try {
			const textArea = document.createElement('textarea');
			textArea.value = text;
			textArea.style.position = 'fixed';
			textArea.style.left = '-999999px';
			document.body.appendChild(textArea);
			textArea.select();
			const success = document.execCommand('copy');
			document.body.removeChild(textArea);
			return success;
		} catch {
			return false;
		}
	}
}

/**
 * Generate share text for game results
 */
export function generateGameShareText(
	game: Game,
	playerRank: number,
	totalPlayers: number,
	portfolioReturn: number
): string {
	const returnPercent = (portfolioReturn / 100).toFixed(2);
	const emoji = playerRank === 1 ? '🏆' : playerRank <= 3 ? '🥈' : '📈';

	return `${emoji} Just finished #${playerRank} out of ${totalPlayers} in CoinDrafts!\n\nPortfolio Return: ${returnPercent}%\n\nThink you can beat me? Join the next game! 🎮`;
}

/**
 * Generate share text for tournament results
 */
export function generateTournamentShareText(
	tournament: Tournament,
	playerRank: number,
	totalPlayers: number,
	totalReturn: number
): string {
	const returnPercent = (totalReturn / 100).toFixed(2);
	const emoji = playerRank === 1 ? '🏆' : playerRank <= 3 ? '🥈' : '📊';

	return `${emoji} Placed #${playerRank} in "${tournament.name}" tournament!\n\n${totalPlayers} players competed\nMy Return: ${returnPercent}%\n\nJoin the next CoinDrafts tournament! 🚀`;
}

/**
 * Generate share text for tournament win
 */
export function generateTournamentWinShareText(
	tournament: Tournament,
	totalReturn: number
): string {
	const returnPercent = (totalReturn / 100).toFixed(2);
	return `🏆 WON "${tournament.name}" tournament on CoinDrafts!\n\nFinal Return: ${returnPercent}%\n\nCan you beat my crypto picks? Join the competition! 💎`;
}

/**
 * Generate share text for portfolio submission
 */
export function generatePortfolioShareText(game: Game, cryptoSymbols: string[]): string {
	const cryptoList = cryptoSymbols.slice(0, 5).join(', ');
	return `🎮 Just entered a CoinDrafts game!\n\nMy picks: ${cryptoList}\n\nLet's see if my portfolio outperforms! 📈`;
}

/**
 * Generate share URL for game
 */
export function getGameShareUrl(gameId: string): string {
	if (typeof window !== 'undefined') {
		return `${window.location.origin}/games/${gameId}`;
	}
	return `https://coindrafts.com/games/${gameId}`;
}

/**
 * Generate share URL for tournament
 */
export function getTournamentShareUrl(tournamentId: string): string {
	if (typeof window !== 'undefined') {
		return `${window.location.origin}/tournaments/${tournamentId}`;
	}
	return `https://coindrafts.com/tournaments/${tournamentId}`;
}

/**
 * Share using Web Share API (native mobile sharing)
 */
export async function shareNative(options: ShareOptions): Promise<boolean> {
	if (typeof navigator !== 'undefined' && navigator.share) {
		try {
			await navigator.share({
				title: options.title,
				text: options.text,
				url: options.url
			});
			return true;
		} catch (err) {
			// User cancelled or share failed
			console.error('Native share failed:', err);
			return false;
		}
	}
	return false;
}
