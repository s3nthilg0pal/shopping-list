/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        retro: {
          bg: '#0f0f23',
          panel: '#1a1a2e',
          border: '#16213e',
          primary: '#00ff41',
          secondary: '#ff6600',
          accent: '#ff0066',
          text: '#e0e0e0',
          muted: '#666680',
          success: '#00ff41',
          danger: '#ff0044',
          gold: '#ffd700',
          cyan: '#00ffff',
        }
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0, 255, 65, 0.3)',
        'pixel-hover': '6px 6px 0px 0px rgba(0, 255, 65, 0.5)',
        'pixel-inset': 'inset 2px 2px 0px 0px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'pixel-bounce': 'pixel-bounce 0.5s steps(3) infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pixel-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}
