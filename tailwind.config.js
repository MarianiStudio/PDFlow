/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        apple: {
          gray: '#1c1c1e',
          dark: '#000000',
          accent: '#0A84FF',
          glass: 'rgba(255, 255, 255, 0.08)',
        }
      }
    },
  },
  plugins: [],
}