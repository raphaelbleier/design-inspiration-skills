import { defineConfig } from 'vite';
// base './' so dist/ works under any sub-path
export default defineConfig({ base: './', build: { target: 'es2022' } });
