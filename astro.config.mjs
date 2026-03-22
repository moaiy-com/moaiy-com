import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // Custom domain active - no base path needed
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
});
