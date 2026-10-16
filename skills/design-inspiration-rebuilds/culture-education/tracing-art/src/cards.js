// Technique: absolutely positioned artwork cards scattered around the copy.
// Scroll: each card drifts at its own speed (scrubbed y, depth 40-260px). Cursor: quickTo parallax, depth * 14px.
// Entrance: scale .6 -> 1 + opacity, stagger .06, power3.out. Click: caption in the hint chip.
import gsap from 'gsap';
import { works, src } from './data.js';
import { reduced } from './scroll.js';

// x/y = centre in % of the section, w = width in px (desktop), idx = artwork
const heroSet = [
  [58, 14, 150, 1.1, 2], [3, 38, 84, .9, 5], [14, 52, 130, 1.4, 1], [93, 38, 90, .8, 7],
  [84, 68, 126, 1.2, 4], [31, 85, 150, .9, 9], [52, 98, 116, 1.5, 3], [97, 96, 84, 1, 6], [4, 97, 120, .8, 13],
];
const stmtSet = [
  [7, 18, 92, 1, 12], [24, 14, 122, 1.2, 8], [72, 6, 112, .8, 10], [88, 28, 170, 1, 13],
  [3, 46, 62, 1.3, 7], [15, 72, 214, 1.1, 4], [90, 56, 70, .9, 6], [74, 44, 196, 1.2, 5], [28, 94, 214, .8, 9], [88, 86, 190, 1, 1],
];

export function buildCards(host, set, hint) {
  const small = innerWidth < 1000 ? 0.55 : 1;
  const els = set.map(([x, y, w, depth, i]) => {
    const wk = works[i % works.length];
    const el = document.createElement('div');
    el.className = 'card';
    el.style.cssText = `left:${x}%;top:${y}%;width:${w * small}px;aspect-ratio:${wk.ar};translate:-50% -50%`;
    el.innerHTML = `<img alt="" loading="lazy" src="${src(wk)}" onerror="this.style.visibility='hidden'">`;
    el.dataset.depth = depth;
    el.addEventListener('click', () => { if (hint) hint.textContent = `${wk.title}, ${wk.by}`; });
    host.append(el);
    return el;
  });
  if (reduced) return;
  gsap.from(els, { scale: 0.6, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.06,
    scrollTrigger: { trigger: host, start: 'top 80%', once: true } });
  els.forEach((el) => {
    const d = +el.dataset.depth;
    gsap.to(el, { y: (d - 1) * 260 - 40, ease: 'none',
      scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: true } });
    const qx = gsap.quickTo(el.firstChild, 'x', { duration: 1.2, ease: 'power3.out' });
    const qy = gsap.quickTo(el.firstChild, 'y', { duration: 1.2, ease: 'power3.out' });
    el._q = [qx, qy, d];
  });
  addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    els.forEach((el) => { const [qx, qy, d] = el._q; qx(-nx * d * 28); qy(-ny * d * 28); });
  });
}
export { heroSet, stmtSet };
