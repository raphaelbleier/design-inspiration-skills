/* Shared mutable state read every frame by the effect modules (no reactivity needed). */
export const state = {
  scroll: 0,       // px
  velocity: 0,     // px/frame, signed (from Lenis)
  speed: 0,        // smoothed 0..1 scroll intensity (drives relief + fast mode)
  fast: false,     // fast-mode flag
  mouse: { x: 0.5, y: 0.5, px: 0, py: 0 }, // normalised (0..1, y down) + pixels
  reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  fine: matchMedia('(hover: hover) and (pointer: fine)').matches,
  route: 'home',
};
