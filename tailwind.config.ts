import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          black: '#000000',
          white: '#FFFFFF',
          yellow: '#FFFF00',
          green: '#00FF00',
          red: '#FF0000',
          blue: '#0000FF',
        },
      },
      boxShadow: {
        neo: '2px 2px 0 #000000',
        'neo-lg': '4px 4px 0 #000000',
      },
      borderWidth: {
        neo: '2px',
      },
      fontFamily: {
        neo: ['system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        badge: ['11px', { lineHeight: '1.2' }],
        price: ['14px', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
} satisfies Config
