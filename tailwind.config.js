/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        court: {
          blue: '#1e3a8a',
          teal: '#0d9488',
          wood: '#d97706',
          dark: '#0f172a'
        }
      }
    },
  },
  plugins: [],
}
