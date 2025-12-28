/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        bg: '#FDFBF7',
        coral: '#FF8FAB',
        teal: '#2A9D8F',
        yellow: '#E9C46A',
        text: '#2D3748'
      }
    },
  },
  plugins: [],
}
