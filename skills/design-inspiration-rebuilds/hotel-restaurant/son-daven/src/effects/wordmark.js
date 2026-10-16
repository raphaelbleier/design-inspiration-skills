/*
 * HALFTONE WORDMARK. The hero logotype is text rendered into an offscreen 2D canvas
 * (black blurred glyphs on white), then fed through the same vertical-bar shader as any
 * photo. The blur gives the glyph edges a grey ramp, and the ramp is what turns into the
 * comb-toothed vertical bars along the letter edges, while the solid core stays full ink.
 *   grid 200 x 14 cells, threshold 215 (near-white -> transparent), fill = --ink.
 */
import { createHalftone } from './halftone.js';
import { $ } from '../core/dom.js';

export async function initWordmark() {
  const target = $('#wordmark');
  await document.fonts.load('700 100px Syncopate');
  const W = 2400, H = 280, size = 100;
  const src = document.createElement('canvas');
  src.width = W; src.height = H;
  const x = src.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
  x.font = `700 ${size}px Syncopate`;
  const m = x.measureText('VAL OREN').width;
  const fs = (size * (W * 0.985)) / m;
  x.font = `700 ${fs}px Syncopate`;
  x.textAlign = 'left'; x.textBaseline = 'middle';
  x.filter = 'blur(6px)'; x.fillStyle = '#000';
  x.fillText('VAL OREN', W * 0.0075, H / 2 + 6);
  const scene = createHalftone(target, [{ source: src, xSquares: 190, ySquares: 15, bgOpacity: 0, fill: '--ink', threshold: 215 }]);
  if (!scene) { target.getContext && (target.style.display = 'none'); }
  return scene;
}
