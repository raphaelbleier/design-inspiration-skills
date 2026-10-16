/**
 * Dialogue box, stepped like stop-motion.
 *  - Pop-in: 0.35s, ease none, scale quantised to 4 steps (stepped.js pop()); hide 0.05s.
 *  - Typewriter at 35 chars/s. Each glyph rises from below its baseline in 4 CSS steps (.c.in / @keyframes rise).
 *  - Glyph wiggle ("boil"): every 0.23s each glyph gets a new random +-0.6px offset through the `translate`
 *    property (separate from `transform`, so it does not fight the rise animation).
 *  - Advance: click the arrow / the box, E, Space or Enter. While typing, advance first completes the line.
 * Name tab = blue (#66BDE6) with hard #488BAA text shadow; body font is a hand-printed caps face (Gaegu).
 */
import { gsap, REDUCED } from './ease.js';
import { boil, pop } from './stepped.js';
import { sfx } from './audio.js';

const root = document.getElementById('dlg'), textEl = root.querySelector('.text'), nameEl = root.querySelector('.tab span');
boil(root, 1.4);
root.querySelector('.tab .face').style.background = 'var(--blue)';
let chars = [], shown = 0, acc = 0, resolve = null, queue = [], open = false;

function setLine(str) {
  textEl.innerHTML = '';
  chars = [];
  str.split(' ').forEach((w) => {
    const span = document.createElement('span'); span.className = 'w';
    [...w].forEach((ch) => { const c = document.createElement('span'); c.className = 'c'; c.textContent = ch; span.append(c); chars.push(c); });
    textEl.append(span, ' ');
  });
  shown = 0; acc = 0;
  if (REDUCED) reveal(chars.length);
}
function reveal(n) { while (shown < n && shown < chars.length) chars[shown++].classList.add('in'); }
const done = () => shown >= chars.length;

gsap.ticker.add((t, dt) => {
  if (!open) return;
  if (!done()) { acc += (dt / 1000) * 35; const n = Math.floor(acc); if (n) { acc -= n; reveal(shown + n); sfx.type(); } }
  if (!REDUCED && t - (gsap.ticker._w || 0) > 0.23) {
    gsap.ticker._w = t;
    chars.forEach((c) => { c.style.setProperty('--wx', ((Math.random() - 0.5) * 1.2).toFixed(2) + 'px'); c.style.setProperty('--wy', ((Math.random() - 0.5) * 1.2).toFixed(2) + 'px'); });
  }
});

function next() {
  if (!open) return;
  if (!done()) { reveal(chars.length); return; }
  sfx.click();
  if (queue.length) setLine(queue.shift());
  else { open = false; pop(root, false, () => { root.hidden = true; resolve && resolve(); }); }
}
root.addEventListener('pointerdown', (e) => { e.stopPropagation(); next(); });
addEventListener('keydown', (e) => { if (open && (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); next(); } });

export const dialogue = {
  get open() { return open; },
  say(lines, name = 'Courier') {
    return new Promise((res) => {
      resolve = res; queue = [...lines]; nameEl.textContent = name;
      root.hidden = false; open = true; setLine(queue.shift()); pop(root, true);
    });
  },
};
