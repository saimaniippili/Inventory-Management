/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F4F4F0', // Brutalist off-white
        card: '#FFFFFF', // Pure white
        border: '#000000', // Pitch black
        primary: '#000000', // Solid black for primary
        'primary-foreground': '#FFFFFF', // White text on black
        secondary: '#FFFFFF', // White
        'secondary-foreground': '#000000', // Black text
        accent: '#000000', // Black
        success: '#10B981',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
