/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'qie-dark': '#050505',
        'qie-card': '#121212', 
        'qie-border': '#333333',
        'neon-purple': '#b026ff',
        'neon-cyan': '#00f3ff',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(176, 38, 255, 0.5), 0 0 20px rgba(176, 38, 255, 0.3)',
      },
      fontFamily: {
        'mono': ['"Courier New"', 'Courier', 'monospace'],
      }
    },
  },
  plugins: [],
}