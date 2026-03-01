/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.{ts,tsx}',
    './App.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

