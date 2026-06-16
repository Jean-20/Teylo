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
    },
  },
  plugins: [],
}