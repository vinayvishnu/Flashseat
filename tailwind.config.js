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
        background: 'rgba(var(--background), <alpha-value>)',
        foreground: 'rgba(var(--foreground), <alpha-value>)',
        primary: {
          DEFAULT: '#FF4757', // Hot Coral for Urgent Actions / Booking / Live sales
          hover: '#FF6B81',
        },
        secondary: {
          DEFAULT: '#8B5CF6', // Vivid Purple for VIP tiers / Premium actions
          hover: '#A78BFA',
        },
        accent: {
          DEFAULT: '#00F2FE', // Neon Cyan for Seats / Quick Select / Interactive cues
          hover: '#4FACFE',
        },
        success: '#10B981', // Emerald green
        warning: '#F59E0B',
        danger: '#EF4444',
        card: 'rgba(var(--card-bg), <alpha-value>)',
        border: 'rgba(var(--border-color), <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'ticket-glow': 'ticketGlow 3s ease infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.7', transform: 'scale(1.05)', filter: 'drop-shadow(0 0 10px rgba(0, 242, 254, 0.5))' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        ticketGlow: {
          '0%, 100%': { 'border-color': 'rgba(255, 71, 87, 0.4)' },
          '50%': { 'border-color': 'rgba(0, 242, 254, 0.7)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
