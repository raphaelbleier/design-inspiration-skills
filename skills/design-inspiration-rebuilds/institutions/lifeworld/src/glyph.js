/**
 * glyph.js - canvas text metrics for the display face, so a glyph or word can be stretched
 * to an exact box (the signature look: condensed capitals pulled to the full width/height).
 * cap = height of capital H, base = distance from the top of a line-height:1 box to the baseline.
 */
const FONT = 'Anton';
const ctx = document.createElement('canvas').getContext('2d');

export function metrics(text, fs = 200) {
  ctx.font = `${fs}px ${FONT}`;
  const h = ctx.measureText('H');
  const m = ctx.measureText(text);
  const fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
  return { width: m.width, cap: h.actualBoundingBoxAscent, base: (fs - (fa + fd)) / 2 + fa };
}

export const ready = () => document.fonts.load(`200px ${FONT}`).then(() => document.fonts.ready);
