/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					'Space Grotesk',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'Roboto',
					'sans-serif'
				],
				mono: ['Monaspace Krypton', 'Courier New', 'monospace']
			},
			colors: {
				'primary-green': '#39ff14',
				'dark-green': '#0bd10b',
				'light-green': '#7bff6b',

				'bg-dark': '#000000',
				'bg-card': '#050505',
				'bg-accent': '#06110a',
				'text-primary': '#e6ffe6',
				'text-secondary': '#9aff9a',
				'border-color': '#072007',
				// Legacy compatibility
				'primary-purple': '#39ff14',
				'dark-purple': '#0bd10b',
				'light-purple': '#7bff6b'
			},
			backgroundImage: {
				'green-gradient': 'linear-gradient(135deg, #39ff14 0%, #7bff6b 100%)',
				'purple-gradient': 'linear-gradient(135deg, #39ff14 0%, #7bff6b 100%)'
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-in',
				'slide-up': 'slideUp 0.3s ease-out'
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			}
		}
	},
	plugins: []
};
