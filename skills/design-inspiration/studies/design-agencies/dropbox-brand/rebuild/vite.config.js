import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';

// Multi-page build: every *.html at the root is an entry. base './' keeps dist portable under any sub-path.
const input = Object.fromEntries(readdirSync('.').filter((f) => f.endsWith('.html')).map((f) => [f.slice(0, -5), resolve(f)]));
export default defineConfig({ base: './', build: { rollupOptions: { input }, assetsInlineLimit: 0 } });
