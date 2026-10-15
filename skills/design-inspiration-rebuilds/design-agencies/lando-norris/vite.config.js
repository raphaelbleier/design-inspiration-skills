import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// base './' makes the build work under any sub-path (GitHub Pages, /preview/ folders ...).
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      // two real pages: the one-page home and the on-track sub page (page-transition demo)
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        track: resolve(import.meta.dirname, 'on-track.html'),
      },
    },
  },
});
