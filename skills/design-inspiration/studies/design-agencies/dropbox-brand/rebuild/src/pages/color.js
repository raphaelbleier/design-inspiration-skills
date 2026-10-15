/*
 * Color.
 *  - opening dropper: hovering a colour drop moves .color-dropper to (100/8)*(2i+1)% and tints it; click recolours the
 *    whole opening (background, lines, title) with that identity pair
 *  - c1 (300vh sticky): outline -> fill headline (fx/mask-reveal.js). The section background steps through
 *    subtle -> #061E16 -> #2D1202 -> plum as the reveal passes words 2, 6, 11 (thresholds from cumulative letter counts)
 *  - chips: hover magnifies the neighbourhood of the cursor (flex-grow = 1 + (mult-1) * max(0, 1 - d/spread));
 *    click copies the hex and the label reads "Copied!" for 2000ms. <=767px: a drag carousel with momentum.
 *  - c3: a horizontal scroller inside a sticky stage; panel i is .active while progress is in its third
 */
import '../shell.js';
import '../styles/pages.css';
import { onFrame, stickyProgress } from '../fx/scroll.js';
import { splitWords } from '../fx/mask-reveal.js';
import { dragScroller } from '../fx/drag-scroller.js';
import { clamp, reduced } from '../easing.js';

/* dropper */
const opening = document.querySelector('.opening'), drops = [...document.querySelectorAll('.drop')], dr = document.querySelector('.color-dropper');
const PAIRS = { blue: ['#b4c8e1', '#283750'], pink: ['#ffafa5', '#892055'], orange: ['#f9a34b', '#6d2e09'], green: ['#b4dc19', '#175641'] };
drops.forEach((d, i) => {
  const move = () => { dr.style.left = `${(100 / 8) * (2 * i + 1)}%`; dr.style.color = PAIRS[d.dataset.c][0]; dr.classList.add('show'); };
  d.addEventListener('mouseenter', move); d.addEventListener('focus', move);
  d.addEventListener('click', () => {
    const [bg, fg] = PAIRS[d.dataset.c];
    opening.style.transition = 'background-color .2s, color .2s'; opening.style.backgroundColor = bg; opening.style.color = fg;
    opening.style.setProperty('--lc', fg + '66'); opening.querySelectorAll('.ol-h,.ol-v').forEach((l) => l.style.setProperty('--lc', fg + '66'));
    opening.classList.add('tinted');
  });
});

/* c1 headline */
const c1 = document.getElementById('c1'), reveal = splitWords(c1.querySelector('.c1-h'));
const STAGES = [
  { at: 0, bg: '#f7f6f5', fg: '#1e1919', sw: 1 },
  { at: reveal.startOf(2), bg: '#061E16', fg: '#b4dc19' },
  { at: reveal.startOf(6), bg: '#2D1202', fg: '#f9a34b' },
  { at: reveal.startOf(11), bg: '#4a1646', fg: '#ffafa5' },
];
let stage = -1;
onFrame(() => {
  const p = reduced() ? 1 : stickyProgress(c1);
  const g = clamp((p - 0.05) / 0.8);
  reveal.update(g);
  let s = 0; STAGES.forEach((st, i) => { if (g >= st.at && (i > 0 || true)) s = i; });
  if (g <= 0) s = 0;
  if (s !== stage) { stage = s; c1.style.backgroundColor = STAGES[s].bg; c1.style.setProperty('--c1-fg', STAGES[s].fg); }
});

/* chips */
const MAG = { widths: [200, 400, 500], mult: [100, 300, 400], spread: [0.5, 0.2, 0.2] };
document.querySelectorAll('.chips').forEach((row, ri) => {
  const inner = row.querySelector('.chips-in'), chips = [...inner.children];
  const mobile = () => innerWidth <= 767;
  row.addEventListener('mousemove', (e) => {
    if (mobile()) return;
    const r = row.getBoundingClientRect(), x = e.clientX - r.left, spread = MAG.spread[ri] * r.width;
    chips.forEach((c) => {
      const cr = c.getBoundingClientRect(), cx = cr.left - r.left + cr.width / 2;
      c.style.flexGrow = 1 + (MAG.mult[ri] / 100 - 1) * Math.max(0, 1 - Math.abs(x - cx) / spread);
    });
  });
  row.addEventListener('mouseleave', () => chips.forEach((c) => (c.style.flexGrow = 1)));
  chips.forEach((c) => c.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(c.dataset.hex); } catch {}
    const l = c.querySelector('.ch'), old = c.dataset.hex.toUpperCase();
    l.textContent = 'Copied!'; clearTimeout(c._t); c._t = setTimeout(() => (l.textContent = old), 2000);
  }));
  if (matchMedia('(max-width:767px)').matches) {
    const max = () => Math.min(0, row.clientWidth - inner.scrollWidth);
    dragScroller(row, { onMove: (x) => { const m = max(); const v = Math.min(0, Math.max(m, x)); inner.style.transform = `translateX(${v}px)`;
      const mid = row.clientWidth / 2; chips.forEach((c) => { const cr = c.getBoundingClientRect(), d = Math.abs(cr.left + cr.width / 2 - mid) / row.clientWidth; c.style.transform = `scale(${1 - Math.min(0.2, d * 0.3)})`; }); } });
  }
});

/* c3 horizontal scroller */
const c3 = document.getElementById('c3'), track = c3.querySelector('.c3-track'), panels = [...c3.querySelectorAll('.c3p')];
onFrame(() => {
  const p = reduced() ? 0 : stickyProgress(c3);
  const maxScroll = Math.max(0, track.scrollWidth - innerWidth + 80);
  track.style.transform = `translateX(${-p * maxScroll}px)`;
  panels.forEach((el, i) => el.classList.toggle('active', p >= i / 3 - 0.001 && p < (i + 1) / 3 + (i === 2 ? 1 : 0)));
});
