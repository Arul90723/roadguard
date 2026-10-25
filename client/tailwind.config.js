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
          950: '#070d1e',
          900: '#0b132b',
          800: '#1c2541',
          700: '#273459',
          600: '#3a4b7c'
        },
        hazard: {
          critical: '#ef4444',
          high: '#f97316',
          moderate: '#eab308',
          low: '#3b82f6',
          resolved: '#10b981'
        }
      }
    },
  },
  plugins: [],
}
