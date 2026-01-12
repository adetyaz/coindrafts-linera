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
				model: 'llama3-8b-8192',
				messages: [
					{
						role: 'system',
						content:
							'You are a cryptocurrency price prediction expert. Provide ONLY a JSON response with minPrice and maxPrice fields (numbers only). No explanations.'
					},
					{
						role: 'user',
						content: `Given ${cryptoId} current price of $${currentPrice}, suggest a realistic 7-day price range. Consider volatility and market trends. Format: {"minPrice": number, "maxPrice": number}`
					}
				],
				temperature: 0.7,
				max_tokens: 100
			})
		});

		const data = await response.json();
		const content = data.choices?.[0]?.message?.content;

		if (!content) {
			throw new Error('No response from AI');
		}

		// Parse JSON from response
		const suggestion = JSON.parse(content);

		return json({ suggestion });
	} catch (error) {
		console.error('AI price prediction error:', error);
		return json({ error: 'Failed to get AI suggestion' }, { status: 500 });
	}
};
