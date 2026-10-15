// Every generated still is bundled by Vite (hashed, relative URL under base './').
const files = import.meta.glob('./assets/img/*.webp', { eager: true, query: '?url', import: 'default' });
export const img = Object.fromEntries(Object.entries(files).map(([p, u]) => [p.split('/').pop().replace('.webp', ''), u]));
