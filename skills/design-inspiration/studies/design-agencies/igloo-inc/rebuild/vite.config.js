import { defineConfig } from 'vite';

// base './' keeps every asset URL relative, so dist/ works under any sub-path.
export default defineConfig({
  base: './',
  build: { target: 'es2022', chunkSizeWarningLimit: 900 },
});
