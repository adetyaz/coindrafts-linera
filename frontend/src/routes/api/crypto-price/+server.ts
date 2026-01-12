import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const cryptoId = url.searchParams.get('cryptoId');

	if (!cryptoId) {
		return json({ error: 'cryptoId parameter required' }, { status: 400 });
	}

	try {
		const response = await fetch(`https://api.coincap.io/v2/assets/${cryptoId}`, {
			headers: {
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			console.error('CoinCap API error:', response.status, response.statusText);
			return json({ error: 'Failed to fetch crypto price' }, { status: response.status });
		}

		const data = await response.json();

		if (!data.data?.priceUsd) {
			return json({ error: 'Price data not available' }, { status: 404 });
		}

		return json({
			cryptoId: data.data.id,
			symbol: data.data.symbol,
			name: data.data.name,
			priceUsd: parseFloat(data.data.priceUsd),
			changePercent24Hr: data.data.changePercent24Hr
				? parseFloat(data.data.changePercent24Hr)
				: null,
			marketCapUsd: data.data.marketCapUsd ? parseFloat(data.data.marketCapUsd) : null,
			volumeUsd24Hr: data.data.volumeUsd24Hr ? parseFloat(data.data.volumeUsd24Hr) : null,
			timestamp: Date.now()
		});
	} catch (error) {
		console.error('Failed to fetch crypto price:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
