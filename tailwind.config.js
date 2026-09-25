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
        vault: {
          darkest: '#050713',
          dark: '#080C1E',
          card: '#0D142E',
          'card-glass': 'rgba(13, 20, 46, 0.65)',
          'card-hover': 'rgba(18, 28, 64, 0.75)',
          border: 'rgba(56, 189, 248, 0.15)',
          'border-focus': 'rgba(0, 240, 255, 0.5)',
          cyan: '#00F0FF',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          magenta: '#EC4899',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 25px rgba(0, 240, 255, 0.35)',
        'neon-purple': '0 0 25px rgba(139, 92, 246, 0.35)',
        'neon-orb': '0 0 50px rgba(0, 240, 255, 0.4), inset 0 0 25px rgba(139, 92, 246, 0.3)',
        'glass': '0 10px 40px -10px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
