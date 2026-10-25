/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        obsidian: {
          950: '#060a14',
          900: '#0a101f',
          850: '#0f172a',
          800: '#162038',
          700: '#1e2c4f',
          600: '#2c3e6b'
        },
        navy: {
          950: '#060a14',
          900: '#0a101f',
          800: '#131d36',
          700: '#1c2b50',
          600: '#293d6e'
        },
        brand: {
          cyan: '#00f2fe',
          teal: '#4facfe',
          glow: '#00f2fe',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e'
        },
        hazard: {
          critical: '#ef4444',
          high: '#f97316',
          moderate: '#eab308',
          low: '#3b82f6',
          resolved: '#10b981'
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'card-lift': '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radar 3s ease-out infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
