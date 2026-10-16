/*
 * PAGE-TRANSITION GRID ("dither" wipe).
 * 240 cells (20 columns x 12 rows) fixed over the viewport. Each cell scales on X
 * 0 -> 1 (cover) or 1 -> 0 (reveal): 0.4s "InOut", stagger { each: 0.03, from: "end",
 * grid: [20, 12] }, so the wipe travels diagonally from the bottom-right corner like a
 * pixel dissolve. Cells use the current theme's background colour (--tbg), so the wipe
 * always matches the page it covers. Total duration ~1.2s.
 * In the original this runs between Barba pages; here it also masks in-page jumps
 * (menu links) and the first-visit preloader.
 */
import { gsap } from '../core/gsap.js';
import { $, $$ } from '../core/dom.js';

let root, cells;

export function buildGrid() {
  root = $('.transition');
  root.innerHTML = '<i></i>'.repeat(240);
  cells = $$('i', root);
}

function paint() {
  const dark = !$('#header').classList.contains('theme_on-light');
  root.style.setProperty('--tbg', dark ? 'var(--ink)' : 'var(--sand)');
}

const stagger = { each: 0.03, from: 'end', grid: [20, 12] };

export function cover() {
  paint();
  root.classList.add('is-on');
  gsap.set(cells, { transformOrigin: 'left center' });
  return gsap.fromTo(cells, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'InOut', stagger }).then();
}

export function reveal() {
  gsap.set(cells, { transformOrigin: 'right center' });
  return gsap.to(cells, { scaleX: 0, duration: 0.4, ease: 'InOut', stagger }).then(() => root.classList.remove('is-on'));
}

/** Start fully covered (preloader). */
export function startCovered(theme = 'dark') {
  root.style.setProperty('--tbg', theme === 'dark' ? 'var(--ink)' : 'var(--sand)');
  root.classList.add('is-on');
  gsap.set(cells, { scaleX: 1 });
}
