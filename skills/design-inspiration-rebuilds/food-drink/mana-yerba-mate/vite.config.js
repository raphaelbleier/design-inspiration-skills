import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// base './' makes the build work under any sub-path. Two real pages: home + subscription
// (the second page exists to demonstrate the circle page transition).
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        subscription: resolve(import.meta.dirname, 'subscription.html'),
      },
    },
  },
});
