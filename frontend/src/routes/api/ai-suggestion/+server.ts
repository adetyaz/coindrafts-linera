import { json, error } from '@sveltejs/kit';
import { GROQ_API_KEY } from '$env/static/private';
import type { RequestHandler } from './$types';

interface SuggestionRequest {
	availableCoins: string[];
	gameType?: string;
	maxPicks?: number;
}

interface CryptoSuggestion {
	symbol: string;
	confidence: number;
	reasoning: string;
}

interface AISuggestionResponse {
	suggestions: CryptoSuggestion[];
	overallStrategy: string;
	timestamp: number;
}

export const POST: RequestHandler = async ({ request }) => {
	if (!GROQ_API_KEY) {
		throw error(500, 'Groq API key not configured');
	}

	const {
		availableCoins,
		gameType = 'standard',
		maxPicks = 5
	}: SuggestionRequest = await request.json();

	if (!availableCoins || availableCoins.length === 0) {
		throw error(400, 'No coins provided');
	}

	// Add variety by including random market context
	const marketConditions = [
		'volatile market with high uncertainty',
		'bullish sentiment with growing adoption',
		'consolidation phase with sideways movement',
		'bearish pressure with regulatory concerns',
		'strong fundamentals driving growth',
		'tech innovation and ecosystem expansion',
		'institutional interest and accumulation phase'
	];
	const randomCondition = marketConditions[Math.floor(Math.random() * marketConditions.length)];

	const prompt = `You are a crypto portfolio advisor for a competitive trading game. Analyze and suggest the best ${maxPicks} cryptocurrencies to pick.

Available coins: ${availableCoins.join(', ')}
Game type: ${gameType}
Current market context: ${randomCondition}
Analysis timestamp: ${new Date().toISOString()}

Provide your response in this EXACT JSON format (no markdown, no code blocks, just pure JSON):
{
  "suggestions": [
    {
      "symbol": "BTC",
      "confidence": 85,
      "reasoning": "Specific explanation with real metrics or analysis - avoid generic marketing phrases"
    },
  ],
  "overallStrategy": "Concrete strategy explaining WHY these picks work together and HOW they address the market context"
}

CRITICAL REQUIREMENTS:
- Confidence should be 0-100 based on actual analysis
- Pick exactly ${maxPicks} coins from the available list
- NO GENERIC MARKETING LANGUAGE like "attractive choice", "makes it ideal", "positioned well"
- Instead provide SPECIFIC reasoning: technical levels, market cap position, recent developments, adoption metrics, competitive advantages with examples
- Explain HOW each coin fits the strategy, not just THAT it fits
- For strategy: explain the risk/reward balance, diversification logic, or concentration thesis
- Consider current market context: ${randomCondition}
- Vary your recommendations - different picks for different conditions
- Be educational: help users understand WHY these picks make sense`;

	try {
		const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${GROQ_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'llama-3.3-70b-versatile',
				messages: [
					{
						role: 'system',
						content:
							'You are a crypto portfolio advisor. Always respond with valid JSON only, no markdown. Provide SPECIFIC, analytical reasoning with real examples and metrics. Avoid generic marketing language. Be educational and explain the "why" behind recommendations.'
					},
					{
						role: 'user',
						content: prompt
					}
				],
				temperature: 0.9,
				max_tokens: 1500
			})
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('Groq API error response:', response.status, errorData);
			// Parse error to show more details
			try {
				const errorJson = JSON.parse(errorData);
				throw error(
					response.status,
					`Groq API error: ${errorJson.error?.message || response.statusText}`
				);
			} catch {
				throw error(
					response.status,
					`Groq API error: ${response.statusText} - ${errorData.substring(0, 200)}`
				);
			}
		}

		const data = await response.json();
		const content = data.choices[0]?.message?.content;

		if (!content) {
			throw error(500, 'No response from AI');
		}

		console.log('Raw AI response:', content);

		// Parse AI response (handle potential markdown wrapping)
		let aiResponse: AISuggestionResponse;
		try {
			// Remove markdown code blocks if present
			let cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();

			// More robust comma cleanup - handle all patterns
			// Remove trailing commas before } or ]
			cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1');
			// Repeat until no more changes (handles deeply nested)
			let previousContent = '';
			while (previousContent !== cleanedContent) {
				previousContent = cleanedContent;
				cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1');
			}

			aiResponse = JSON.parse(cleanedContent);
		} catch (parseError) {
			console.error('Failed to parse AI response:', content);
			console.error('Parse error:', parseError);
			// Final attempt - extract JSON and aggressively clean
			try {
				const jsonMatch = content.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					let extracted = jsonMatch[0];
					// Remove ALL trailing commas iteratively
					let prev = '';
					while (prev !== extracted) {
						prev = extracted;
						extracted = extracted.replace(/,(\s*[}\]])/g, '$1');
					}
					aiResponse = JSON.parse(extracted);
				} else {
					throw error(500, `Invalid AI response format - no JSON found in response`);
				}
			} catch {
				throw error(500, `Invalid AI response format. Could not parse JSON.`);
			}
		}

		// Validate response structure
		if (!aiResponse.suggestions || !Array.isArray(aiResponse.suggestions)) {
			console.error('Invalid AI response structure:', aiResponse);
			throw error(500, 'Invalid AI response structure - missing suggestions array');
		}

		// Validate each suggestion has required fields
		for (const suggestion of aiResponse.suggestions) {
			if (
				!suggestion.symbol ||
				typeof suggestion.confidence !== 'number' ||
				!suggestion.reasoning
			) {
				console.error('Invalid suggestion format:', suggestion);
				throw error(500, 'Invalid suggestion format - missing required fields');
			}
		}

		// Add timestamp
		const result: AISuggestionResponse = {
			...aiResponse,
			timestamp: Date.now()
		};

		return json(result);
	} catch (e: unknown) {
		console.error('AI suggestion error:', e);
		if (e && typeof e === 'object' && 'status' in e) throw e;
		throw error(500, e instanceof Error ? e.message : 'Failed to generate AI suggestions');
	}
};
