import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // For GitHub Pages deployment on subpath
  // Remove 'base' when custom domain (moaiy.com) is active
  base: '/moaiy-com/',
  site: 'https://moaiy.com',
  integrations: [
    react(),
    tailwind()
  ],
  output: 'static',
  build: {
    assets: 'assets'
  },
  vite: {
    ssr: {
      // Mark Three.js packages as noExternal for SSR compatibility
      noExternal: ['@react-three/fiber', '@react-three/drei', 'three']
    }
  }
});;
