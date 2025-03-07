/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        'pure-black': '#000000',
        darkgrey: '#0a0a0a',
        darkergrey: '#050505',
        secondary: '#00b6dd',
        glass: 'rgba(0, 0, 0, 0.7)',
      },
      borderWidth: {
        '1': '1px',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        'league-spartan': ['"League Spartan"', 'sans-serif'],
      },
      fontWeight: {
        extrabold: 800,
      },
      letterSpacing: {
        tightest: '-0.1em',
      },
    },
  },
  plugins: [],
}
