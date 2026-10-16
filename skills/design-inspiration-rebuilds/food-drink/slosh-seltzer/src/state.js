/** Shared mutable state, written by ScrollTriggers and read by the WebGL render loop. */
export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const state = { fruit: reduced ? 1 : 0, bands: 0, pop: 0, mx: 0, my: 0 };
