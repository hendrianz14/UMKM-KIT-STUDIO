import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}', // <-- PATH PENTING DITAMBAHKAN DI SINI
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D47A1', // Deep Blue
        secondary: '#1565C0', // Medium Blue
        accent: '#FFC107', // Amber/Yellow
        light: '#F5F5F5', // Light Gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        subtlePulse: {
          '0%, 100%': { borderColor: 'rgba(255, 193, 7, 0.4)' },
          '50%': { borderColor: 'rgba(255, 193, 7, 1)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fadeInTopRight: {
          from: {
            opacity: '0',
            transform: 'translate(20px, -20px) scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'translate(0, 0) scale(1)',
          },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.8s ease-out forwards',
        subtlePulse: 'subtlePulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin-slow 5s linear infinite',
        shimmer: 'shimmer 3s linear infinite',
        fadeInTopRight: 'fadeInTopRight 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
};
export default config;
