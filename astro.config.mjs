import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const excludedPaths = new Set(['/404/', '/roadmap/', '/release-notes/']);

// https://astro.build/config
export default defineConfig({
  site: 'https://moaiy.com',
  trailingSlash: 'always',
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
    assets: 'assets',
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@react-three/fiber', '@react-three/drei', 'three'],
    },
  },
});
