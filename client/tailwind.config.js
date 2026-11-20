/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'warzone-void': '#0a0a0c',
        'warzone-deep': '#050507',
        'warzone-panel': 'rgba(18, 18, 22, 0.88)',
        'warzone-red': {
          DEFAULT: '#FF3434',
          bright: '#ff5252',
          deep: '#b81c1c'
        },
        'warzone-gold': {
          DEFAULT: '#FFD34D',
          bright: '#ffe58a',
          deep: '#b8860b'
        }
      },
      fontFamily: {
        heading: ['Teko', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        esports: ['Rajdhani', 'sans-serif']
      },
      boxShadow: {
        'red-glow': '0 0 25px rgba(255, 52, 52, 0.5)',
        'gold-glow': '0 0 20px rgba(255, 211, 77, 0.45)'
      }
    },
  },
  plugins: [],
}
