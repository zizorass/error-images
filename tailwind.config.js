/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.35em',
      },
      colors: {
        chrome: {
          black: '#050506',
          ink: '#0a0a0c',
          silver: '#d8dce0',
          bone: '#eef1f4',
        },
      },
    },
  },
  plugins: [],
}
