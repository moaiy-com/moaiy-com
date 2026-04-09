/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Moaiy Brand Colors
        'bg-primary': '#0A0E27',      // Deep space blue
        'bg-secondary': '#151B3B',    // Midnight blue
        'bg-tertiary': '#1E2545',     // Dark purple blue
        'accent-primary': '#4ECDC4',  // Mint green ⭐
        'accent-secondary': '#45B7D1', // Sky blue
        'text-primary': '#F9FAFB',    // Almost white
        'text-secondary': '#D1D5DB',  // Light gray
        'text-tertiary': '#9CA3AF',   // Medium gray
      },
      fontFamily: {
        'heading': ['Scope One', 'serif'],
        'body': ['Scope One', 'serif'],
        'code': ['Scope One', 'serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
