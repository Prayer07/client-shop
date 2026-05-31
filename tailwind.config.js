/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        verdana: ['Verdana', 'Geneva', 'Tahoma', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        blush: '#E6C7BE',
        brown: '#4A3A32',
        cream: '#F7F3EE',
        gold: '#C6A75E',
        taupe: '#8E7F76',
      },
    },
  },
  plugins: [],
}