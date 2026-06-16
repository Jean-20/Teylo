/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Lexend', 'sans-serif'] },
      colors: {
        primary: '#9333EA',
        'gray-carbon': '#505050',
        'gray-soft': '#EEEEEE',
        'white-paper': '#FCFCFC',
      },
      keyframes: {
        fadeInScale: {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)'   },
        },
      },
      animation: {
        'fadeInScale': 'fadeInScale 0.25s ease-out',
      },
    },
  },
  plugins: [],
}