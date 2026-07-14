/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Control Room obsidian/slate base colors
        obsidian: {
          950: '#060a13',
          900: '#0b0f19',
          850: '#141a27',
          800: '#1e293b',
          700: '#334155',
        },
        // Cyber-Resilience accent colors
        neon: {
          emerald: '#34d399',
          crimson: '#f43f5e',
          amber: '#fbbf24',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s infinite ease-in-out',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(52, 211, 153, 0.2)' },
          '50%': { boxShadow: '0 0 15px rgba(52, 211, 153, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
