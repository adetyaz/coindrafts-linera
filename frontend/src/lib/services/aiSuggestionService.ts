export interface CryptoSuggestion {
	symbol: string;
	confidence: number;
	reasoning: string;
}

export interface AISuggestionResponse {
	suggestions: CryptoSuggestion[];
	overallStrategy: string;
	timestamp: number;
}

interface SuggestionRequest {
	availableCoins: string[];
	gameType?: string;
	maxPicks?: number;
}

export async function getAISuggestions(request: SuggestionRequest): Promise<AISuggestionResponse> {
	// Don't use cache - always get fresh suggestions with different reasoning
	// This ensures variety in AI recommendations

	const response = await fetch('/api/ai-suggestion', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(request)
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Failed to get AI suggestions: ${error}`);
	}

	return await response.json();
}
