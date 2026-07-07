/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#FAF7F2',
        saffron: {
          light: '#F4A261',
          DEFAULT: '#F4A261',
          dark: '#E76F51',
        },
        mint: {
          light: '#A8DADC',
          DEFAULT: '#81B29A',
        }
      },
      fontFamily: {
        serif: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
