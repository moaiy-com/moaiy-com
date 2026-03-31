import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://moaiy.com',
  trailingSlash: 'always',
  integrations: [react(), tailwind(), sitemap()],
  output: 'static',
  build: {
    assets: 'assets',
  },
  vite: {
    server: {
      allowedHosts: ['.monkeycode-ai.online'],
    },
    ssr: {
      noExternal: ['@react-three/fiber', '@react-three/drei', 'three'],
    },
  },
});
