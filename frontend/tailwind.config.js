/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trello: {
          blue: '#0079BF',
          green: '#70B500',
          orange: '#FF9F1A',
          red: '#EB5A46',
          purple: '#C377E0',
          pink: '#FF78CB',
          lime: '#51E898',
          sky: '#00C2E0',
          gray: '#C4C9CC',
        }
      }
    },
  },
  plugins: [],
} 