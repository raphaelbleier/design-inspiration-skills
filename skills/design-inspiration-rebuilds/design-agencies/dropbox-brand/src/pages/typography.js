/*
 * Typography.
 *  1. Variable-font playground in the opening: B / W / I pick the active axis (wght 200-800, wdth 75-100, slant on/off),
 *     the slider writes it to CSS custom properties (--wght, --wdth, --slant) used by every .vf block and the title;
 *     Randomize gives every word its own weight/width. (The original also balances line widths; we keep it simple.)
 *  2. Per-letter scroll fill: each letter is a span; letter i has
 *        ratio = (scrolled - limit*0.7*i/n) / (limit*0.1)   clamped 0..1, easeOutQuad
 *     colour = rgb(255*(1-ratio)) with a 4-direction 1px text-shadow of rgba(115,108,100, 1-ratio):
 *     white text with a grey outline turns into solid black text. Also drives the "N% complete" label and its hairline.
 *     Three cursor tags orbit with cos/sin; their random seeds are re-rolled once per scroll burst (100ms idle).
 *  3. Contrast card: the overlay height follows (viewportHalf - top) / height; fixed at 50% for reduced motion.
 */
import '../shell.js';
import '../styles/pages.css';
import { onFrame, stickyProgress } from '../fx/scroll.js';
import { cursorTag } from '../fx/cursor-tags.js';
import { easeOutQuad, clamp, reduced } from '../easing.js';

const root = document.documentElement;
const state = { m: 'wght', wght: 500, wdth: 100, slant: 0 };
const map = { wght: (v) => 200 + v * 6, wdth: (v) => 75 + v * 0.25 };
const apply = () => { root.style.setProperty('--wght', state.wght); root.style.setProperty('--wdth', state.wdth + '%'); root.style.setProperty('--slant', state.slant ? 'italic' : 'normal'); };
apply();
const bs = [...document.querySelectorAll('.tp-b')], range = document.querySelector('.tp-r');
bs.forEach((b) => b.addEventListener('click', () => {
  state.m = b.dataset.m; bs.forEach((x) => x.classList.toggle('on', x === b));
  range.value = state.m === 'wght' ? (state.wght - 200) / 6 : state.m === 'wdth' ? (state.wdth - 75) * 4 : state.slant ? 100 : 0;
}));
range.addEventListener('input', () => {
  const v = +range.value;
  if (state.m === 'ital') state.slant = v > 50 ? 1 : 0; else state[state.m] = map[state.m](v);
  root.classList.remove('randomized'); document.querySelectorAll('.rw').forEach((w) => w.removeAttribute('style'));
  apply();
});
const rw = (el) => {
  if (el.querySelector('.rw')) return;
  el.innerHTML = el.textContent.split(' ').map((w) => `<span class="rw">${w}</span>`).join(' ');
};
const targets = [document.querySelector('.opening .title'), ...document.querySelectorAll('.vf')];
document.querySelector('.tp-rand').addEventListener('click', () => {
  targets.forEach(rw);
  document.querySelectorAll('.rw').forEach((w) => {
    w.style.fontWeight = Math.round(200 + Math.random() * 600); w.style.fontStretch = Math.round(75 + Math.random() * 25) + '%';
    w.style.fontStyle = Math.random() > 0.8 ? 'italic' : 'normal';
  });
});

/* letter fill */
const fill = document.getElementById('tp-fill'), h = fill.querySelector('.heading-fill');
const text = h.getAttribute('aria-label');
h.innerHTML = text.split(' ').map((w) => `<span class="fw" aria-hidden="true">${[...w].map((c) => `<span class="fl">${c}</span>`).join('')}</span>`).join(' ');
const letters = [...h.querySelectorAll('.fl')], n = letters.length;
const label = fill.querySelector('.fl-label'), line = fill.querySelector('.fill-line');
const tags = [['Type Director', 'TD', 'purple'], ['Type Designer', 'TD', 'orange'], ['Halden CEO', 'HC', 'green']].map(([name, ini, id], i) => {
  const t = cursorTag({ name, initials: ini, id, right: i === 1 }); fill.querySelector('.o' + (i + 1)).append(t); return t;
});
let seeds = [0, 1, 2].map(() => ({ a: Math.random() * 6, b: Math.random() * 6, rx: 20 + Math.random() * 50, ry: 15 + Math.random() * 30 }));
let idle;
addEventListener('scroll', () => { clearTimeout(idle); idle = setTimeout(() => (seeds = seeds.map(() => ({ a: Math.random() * 6, b: Math.random() * 6, rx: 20 + Math.random() * 50, ry: 15 + Math.random() * 30 }))), 100); }, { passive: true });
const mobile = () => innerWidth <= 767;
onFrame(() => {
  const p = reduced() ? 1 : stickyProgress(fill);
  letters.forEach((l, i) => {
    const r = easeOutQuad(clamp((p - 0.7 * i / n * 0.9) / 0.09));
    const c = Math.round(255 * (1 - r) * (mobile() ? 0.7 : 1)), a = 1 - r;
    l.style.color = `rgb(${c},${c},${c})`;
    l.style.textShadow = a > 0.01 ? [[-1, 0], [1, 0], [0, -1], [0, 1]].map(([x, y]) => `${x}px ${y}px 0 rgba(115,108,100,${a})`).join(',') : 'none';
  });
  label.textContent = `${Math.round(p * 100)}% complete`;
  line.style.top = `${15 + p * 70}%`;
  const t = p * Math.PI * 2;
  tags.forEach((tag, i) => { const s = seeds[i]; tag.style.transform = `translate(${Math.cos(t * 1.3 + s.a) * s.rx}px, ${Math.sin(t * 1.7 + s.b) * s.ry}px)`; });
});
tags.forEach((t) => (t.style.transition = 'transform .6s var(--nav-easing), background-color .3s, color .3s'));

/* contrast card */
const card = document.querySelector('.ccard'), over = card.querySelector('.cc-over');
onFrame(() => {
  const r = card.getBoundingClientRect();
  const v = reduced() ? 50 : clamp((innerHeight / 2 - r.top) / r.height) * 100;
  over.style.height = v + '%';
});
