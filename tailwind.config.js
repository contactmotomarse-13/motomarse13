/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f8ff',
          100: '#e6eeff',
          200: '#c4d5ff',
          300: '#9cb6ff',
          400: '#6f90ff',
          500: '#4167ff',
          600: '#2a4be6',
          700: '#203ab4',
          800: '#1a2f8c',
          900: '#182a72'
        }
      }
    }
  },
  plugins: []
}
