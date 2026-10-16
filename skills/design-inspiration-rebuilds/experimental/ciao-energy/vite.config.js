import { defineConfig } from 'vite';

// base './' makes the build work under any sub-path.
export default defineConfig({ base: './', build: { chunkSizeWarningLimit: 1200 } });
