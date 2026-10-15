/*
 * Opening doodles: simple, deliberately legible stroke icons (a lesson from earlier studies:
 * freehand-traced lettering turns illegible, so shapes stay icon-like and the one "word" doodle
 * uses a script Google Font). All use stroke="currentColor" so a colour class recolours them.
 * Stroke: 5px, round caps/joins; coordinates have small deliberate wobble to read as hand-drawn.
 */
const S = 'fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"';
const svg = (vb, body) => `<svg viewBox="${vb}" ${S} aria-hidden="true">${body}</svg>`;
export const DOODLES = {
  folder: svg('0 0 150 100', '<path d="M6 8l38 2 8 9 54 2 34 3-8 70-86 4z"/><path d="M26 31l112 4"/>'),
  crown: svg('0 0 110 90', '<path d="M8 72l-3-48 28 22 21-38 22 38 28-22-2 48z"/>'),
  heart: svg('0 0 100 100', '<path d="M50 90C20 62 8 46 12 30c4-17 28-20 38-4 10-16 36-13 38 6 2 16-12 32-38 58z"/>'),
  bolt: svg('0 0 80 150', '<path d="M42 6L14 62l22 10-20 42 12 4 30-62-22-10 14-40z"/>'),
  bubble: `<svg viewBox="0 0 110 60" ${S} aria-hidden="true"><path d="M8 6h92l2 38H40L16 54l6-10H8z"/><text x="56" y="36" text-anchor="middle" font-family="Caveat Brush, cursive" font-size="30" fill="currentColor" stroke="none">HI!</text></svg>`,
  plane: svg('0 0 100 100', '<rect x="6" y="6" width="88" height="88" rx="20"/><path d="M30 52l42-24-14 44-12-14zM46 58l26-30"/>'),
  sparks: svg('0 0 100 70', '<path d="M10 8l4 24M44 14l-4 22M76 28l-14 16"/>'),
  star: svg('0 0 100 100', '<path d="M50 8l12 28 30 3-23 20 7 30-26-16-26 16 7-30L8 39l30-3z"/>'),
  pencil: svg('0 0 110 40', '<path d="M6 20l16-12h74l8 12-8 12H22zM22 8v24"/>'),
  squiggle: svg('0 0 140 40', '<path d="M6 24c10-22 18-22 26 0s16 22 26 0 18-22 26 0 16 22 26 0"/>'),
  cube: svg('0 0 100 100', '<path d="M50 6l38 20v44L50 94 12 70V26zM12 26l38 22 38-22M50 48v46"/>'),
  eye: svg('0 0 120 70', '<path d="M6 36C28 8 92 8 114 36 92 62 28 62 6 36z"/><circle cx="60" cy="36" r="13"/>'),
  arrow: svg('0 0 120 70', '<path d="M8 50C34 12 70 8 106 24M84 10l22 14-18 20"/>'),
};
