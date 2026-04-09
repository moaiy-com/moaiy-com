/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Moaiy Light Palette (user-selected)
        'bg-primary': '#ffffff',
        'bg-secondary': '#f4f8ff',
        'bg-tertiary': '#eaf1ff',
        'accent-primary': '#2541b2',
        'accent-secondary': '#1768ac',
        'accent-tertiary': '#06bee1',
        'text-primary': '#03256c',
        'text-secondary': '#1768ac',
        'text-tertiary': '#2541b2',
        'line-subtle': '#d7e2fb',
        'line-strong': '#b9c8ee',
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
