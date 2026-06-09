/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          sand: '#f6efe5',
          bark: '#2e2620',
          amber: '#d97706',
        },
      },
    },
  },
  plugins: [],
}
