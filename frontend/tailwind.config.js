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
        navy: {
          50: '#f0f3ff',
          100: '#dbe4fe',
          200: '#bfcdfd',
          500: '#3b55d9',
          700: '#1d277d',
          800: '#182063',
          900: '#1F2C8F', // Primary navy blue
          950: '#0c123b',
        },
        primary: {
          DEFAULT: '#1F2C8F',
          dark: '#162066',
          light: '#2E3FA9',
        },
        secondary: {
          DEFAULT: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
        },
        tealAccent: {
          DEFAULT: '#0F766E',
          light: '#14B8A6',
          dark: '#115E59',
        },
        lightBg: '#EFF6FF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 10px 25px -3px rgba(31, 44, 143, 0.1), 0 4px 10px -2px rgba(31, 44, 143, 0.05)',
      }
    },
  },
  plugins: [],
}
