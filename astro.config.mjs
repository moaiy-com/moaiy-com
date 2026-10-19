import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://moaiy.com',
  trailingSlash: 'always',
  integrations: [react(), sitemap()],
  output: 'static',
  build: {
    assets: 'assets',
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['.monkeycode-ai.online'],
    },
    ssr: {
      noExternal: ['@react-three/fiber', '@react-three/drei', 'three'],
    },
  },
});
