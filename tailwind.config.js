/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.tsx',
    './app/**/*.ts',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans JP', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
