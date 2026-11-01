import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const excludedPaths = new Set(['/404/', '/roadmap/', '/release-notes/']);

// https://astro.build/config
export default defineConfig({
  site: 'https://moaiy.com',
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        try {
          const { pathname } = new URL(page);
          return !excludedPaths.has(pathname);
        } catch {
          return true;
        }
      },
    }),
  ],
  output: 'static',
  build: {
    format: 'directory',
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom', 'three'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
    },
  },
});
