import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures assets load correctly on GitHub Pages, Netlify, Vercel, or subpaths
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
