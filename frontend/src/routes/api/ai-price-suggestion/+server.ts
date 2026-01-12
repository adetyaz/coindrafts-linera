import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GROQ_API_KEY } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	const { cryptoId, currentPrice } = await request.json();

	if (!GROQ_API_KEY) {
		console.error('GROQ_API_KEY not found in environment');
		return json({ error: 'Groq API key not configured' }, { status: 500 });
	}

	try {
		const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${GROQ_API_KEY}`
			},
			body: JSON.stringify({
				model: 'llama-3.3-70b-versatile',
				messages: [
					{
						role: 'system',
						content:
							'You are a professional cryptocurrency analyst. Provide realistic 7-day price predictions based on current market data, technical analysis, and volatility patterns. Always respond with ONLY valid JSON - no markdown, no explanations.'
					},
					{
						role: 'user',
						content: `Analyze ${cryptoId.toUpperCase()} with current price of $${currentPrice.toFixed(2)}. 

Provide a realistic 7-day price range prediction considering:
- Historical volatility (${cryptoId} typically moves ±5-15% weekly)
- Market sentiment and recent trends
- Support/resistance levels around current price
- Risk/reward ratio for prediction accuracy

Be REALISTIC - don't suggest extreme ranges. For Bitcoin, 3-7% range is typical. For altcoins, 8-15% is common.

Respond with ONLY this JSON format (no markdown):
{
  "minPrice": number (realistic 7-day low),
  "maxPrice": number (realistic 7-day high),
  "reasoning": "Brief technical analysis explaining the range"
}`
					}
				],
				temperature: 0.7,
				max_tokens: 200
			})
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error('Groq API error:', response.status, errorData);
			return json({ error: `Groq API error: ${response.statusText}` }, { status: 500 });
		}

		const data = await response.json();
		const content = data.choices?.[0]?.message?.content;

		if (!content) {
			console.error('No content in AI response:', data);
			return json({ error: 'No response from AI' }, { status: 500 });
		}

		// Parse JSON from response (remove markdown if present)
		let suggestion;
		try {
			const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
			suggestion = JSON.parse(cleanedContent);
		} catch (parseError) {
			console.error('Failed to parse AI response:', content, parseError);
			// Try to extract JSON object
			const jsonMatch = content.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				try {
					suggestion = JSON.parse(jsonMatch[0]);
				} catch {
					return json({ error: 'Invalid AI response format' }, { status: 500 });
				}
			} else {
				return json({ error: 'Could not parse AI response' }, { status: 500 });
			}
		}

		// Validate suggestion has required fields
		if (
			!suggestion ||
			typeof suggestion.minPrice !== 'number' ||
			typeof suggestion.maxPrice !== 'number'
		) {
			console.error('Invalid suggestion structure:', suggestion);
			return json({ error: 'AI returned invalid price range' }, { status: 500 });
		}

		// Validate price range makes sense
		if (suggestion.minPrice >= suggestion.maxPrice || suggestion.minPrice <= 0) {
			console.error('Invalid price range:', suggestion);
			return json({ error: 'AI returned invalid price values' }, { status: 500 });
		}

		console.log('Valid AI suggestion:', suggestion);
		return json({ suggestion });
	} catch (error) {
		console.error('AI price prediction error:', error);
		return json({ error: 'Failed to get AI suggestion' }, { status: 500 });
	}
};
