/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50:  '#f0f1fa',
          100: '#dde0f5',
          200: '#c0c5ee',
          300: '#9aa2e3',
          400: '#757fd5',
          500: '#5a65c5',
          600: '#525EA7',   // brand primary
          700: '#434e91',
          800: '#373f77',
          900: '#2f3562',
        },
        amber: {
          300: '#ffd98a',
          400: '#FFC349',   // brand accent
          500: '#f5a623',
          600: '#d4890f',
        },
        sky: {
          400: '#5FACD3',   // brand sky
          300: '#97DDE9',   // brand light cyan
        },
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
