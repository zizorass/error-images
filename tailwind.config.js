/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
      colors: {
        koala: {
          night: '#120c06',
          bg: '#171006',
          coffee: '#241708',
          cream: '#f4e7d0',
          milk: '#fbf3e4',
          caramel: '#e0a04a',
          gold: '#f2c073',
          amber: '#c97b1e',
          deep: '#7a4a12',
          banana: '#ffd873',
          espresso: '#3b2415',
          sea: '#7fd8d0',
        },
      },
      letterSpacing: {
        widest2: '0.35em',
      },
      boxShadow: {
        caramel: '0 20px 60px -15px rgba(224, 160, 74, 0.35)',
        'caramel-lg': '0 30px 90px -20px rgba(224, 160, 74, 0.5)',
      },
    },
  },
  plugins: [],
}
