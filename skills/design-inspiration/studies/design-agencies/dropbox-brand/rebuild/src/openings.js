/*
 * Per-page opening furniture: [doodle|tag|card, left%, top%, size px, colour, rotate deg].
 * Positions are percentages of the 100vh opening so the composition scales with the viewport.
 */
import { DOODLES } from './fx/doodles.js';
import { cursorTag } from './fx/cursor-tags.js';

const C = { blue: '#3080ff', lime: '#b4dc19', red: '#fa551e', purple: '#c8aff0', cyan: '#14c8eb', yellow: '#fad24b', pink: '#ffafa5', orange: '#ff8c19' };
export const OPENINGS = {
  framework: [['folder', 52, 12, 150, 'blue', 2], ['crown', 19, 29, 108, 'lime', -4], ['sparks', 34, 34, 80, 'cyan', 0], ['bolt', 85, 25, 70, 'red', 6], ['bubble', 91, 23, 66, 'red', 0], ['heart', 65, 55, 100, 'purple', 8], ['plane', 23, 66, 56, 'blue', 0], ['photo', 22, 82, 505, 'film-set', 0], ['sheet', 66, 87, 330, '', -4]],
  'voice-and-tone': [['bubble', 18, 22, 110, 'yellow', -4], ['heart', 76, 20, 80, 'pink', 8], ['squiggle', 32, 72, 140, 'cyan', 0], ['star', 80, 70, 70, 'lime', 12], ['tag', 14, 63, 0, 'Copy Chief|CC|yellow', 0], ['tag', 64, 31, 0, 'Brand Lead|BL|blue', 0]],
  logo: [['cube', 17, 22, 76, 'cyan', -6], ['sparks', 60, 18, 90, 'blue', 0], ['arrow', 70, 72, 130, 'lime', 0], ['star', 28, 70, 60, 'yellow', 8], ['tag', 76, 33, 0, 'Art Director|AD|orange', 0]],
  typography: [['pencil', 20, 22, 120, 'red', -8], ['squiggle', 62, 22, 150, 'orange', 0], ['star', 22, 72, 66, 'purple', 10], ['eye', 76, 70, 100, 'cyan', 0], ['tag', 60, 33, 0, 'Type Designer|TD|green', 0], ['tag', 24, 61, 0, 'Type Director|TD|purple', 0]],
  iconography: [['cube', 20, 20, 80, 'blue', 6], ['crown', 70, 18, 100, 'orange', -6], ['folder', 18, 70, 120, 'lime', 4], ['heart', 76, 68, 76, 'pink', -10], ['sparks', 50, 80, 80, 'cyan', 0]],
  color: [['heart', 21, 20, 86, 'pink', -8], ['star', 74, 22, 76, 'yellow', 10], ['squiggle', 56, 76, 140, 'purple', 0], ['sparks', 26, 72, 80, 'lime', 0], ['tag', 70, 62, 0, 'Brand Lead|BL|orange', 0]],
  imagery: [['eye', 17, 20, 100, 'pink', -4], ['plane', 74, 20, 64, 'blue', 0], ['arrow', 24, 74, 130, 'yellow', 0], ['sparks', 76, 70, 90, 'cyan', 0], ['tag', 58, 34, 0, 'Illustrator|IL|purple', 0]],
  motion: [['arrow', 20, 20, 130, 'purple', 0], ['bolt', 74, 16, 60, 'yellow', 8], ['sparks', 22, 70, 90, 'cyan', 0], ['squiggle', 64, 76, 150, 'lime', 0], ['tag', 68, 35, 0, 'Motion Lead|ML|purple', 0]],
};

export function buildOpening(slug, root) {
  const frag = document.createDocumentFragment();
  for (const [kind, l, t, size, col, rot] of OPENINGS[slug] ?? []) {
    const el = document.createElement('div');
    el.className = `oel oel-${kind}`;
    el.style.cssText = `left:${l}%;top:${t}%;--rot:${rot}deg;`;
    if (kind === 'tag') { const [name, initials, id] = col.split('|'); el.append(cursorTag({ name, initials, id })); }
    else if (kind === 'photo') { el.style.width = `min(${size}px,36vw)`; el.innerHTML = `<img src="${new URL(`./img/${col}.webp`, import.meta.url).href}" alt="" loading="eager">`; }
    else if (kind === 'sheet') { el.style.width = `min(${size}px,24vw)`; el.innerHTML = `<div class="sheet"><b>Quarter Plan</b><span>2024</span><span>2025</span><i></i><i></i><i></i></div>`; }
    else { el.style.width = size + 'px'; el.style.color = C[col]; el.innerHTML = DOODLES[kind]; }
    frag.append(el);
  }
  root.append(frag);
}
