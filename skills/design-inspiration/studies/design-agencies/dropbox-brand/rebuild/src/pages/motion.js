/*
 * Motion.
 *  - motion-2 (200vh sticky): h1 words reveal through an outline->fill mask (fx/mask-reveal.js, easeOutQuad);
 *    three bounding boxes grow in width in sequence (width = p*100%); a marker sweeps a fake timeline and the readout
 *    prints mm:ss of p*600 over 10:00; the zoom slider sets the timeline width to zoom*2% (0.2s ease);
 *    "Frame render time" prints the real rAF delta, refreshed at 24fps and truncated to one decimal
 *  - bezier editor: two draggable handles (defaults p1 {65,100}, p2 {45,0} => cubic-bezier(0.65, 0, 0.45, 1)); on release
 *    a plane flies for 3s along that very curve to translate(1600px,-600px), cycling five planes
 *  - keyframe lanes: each lane starts with a random translateX (+-150%), scaleX (1-3) and skewX (+-25deg) and resolves to
 *    identity as ratio runs with easeOutQuad; lane i is offset by limit*0.8*i/n
 *  - reel selector: one of three CSS-only clips is shown at a time
 */
import '../shell.js';
import '../styles/pages.css';
import { onFrame, stickyProgress } from '../fx/scroll.js';
import { splitWords } from '../fx/mask-reveal.js';
import { easeOutQuad, clamp, reduced } from '../easing.js';

const m2 = document.getElementById('motion-2');
const words = splitWords(m2.querySelector('.mo-h'));
const bbs = [...m2.querySelectorAll('.bb')], marker = m2.querySelector('.marker'), tc = m2.querySelector('.tc');
const pad = (n) => String(n).padStart(2, '0');
onFrame(() => {
  const p = reduced() ? 1 : stickyProgress(m2);
  words.update(clamp(p / 0.55));
  bbs.forEach((b, i) => { b.style.width = `${clamp((p - i * 0.18) / 0.3) * 100}%`; b.style.opacity = clamp((p - i * 0.18) / 0.05); });
  marker.style.left = `${p * 100}%`;
  const v = Math.round(p * 600); tc.firstChild.textContent = `${pad(Math.floor(v / 60))}:${pad(v % 60)}`;
});
const zoom = m2.querySelector('.zoom input'), tin = m2.querySelector('.tl-in');
const setZoom = () => (tin.style.width = `${zoom.value * 2}%`);
zoom.addEventListener('input', setZoom); setZoom();
const frt = m2.querySelector('.frt b'); let lastT = performance.now(), lastShow = 0;
(function loop(t) { const dt = t - lastT; lastT = t; if (t - lastShow > 1000 / 24) { lastShow = t; frt.textContent = `${(Math.floor(dt * 10) / 10).toFixed(1)} ms`; } requestAnimationFrame(loop); })(lastT);

/* bezier editor */
const ed = document.querySelector('.bz-ed'), h1 = ed.querySelector('.h1'), h2 = ed.querySelector('.h2');
const cv = ed.querySelector('.bz-cv'), ln = ed.querySelector('.bz-ln'), out = document.querySelector('.bz-out');
const P = { p1: { x: 65, y: 100 }, p2: { x: 45, y: 0 } };
const draw = () => {
  h1.style.left = P.p1.x + '%'; h1.style.top = P.p1.y + '%'; h2.style.left = P.p2.x + '%'; h2.style.top = P.p2.y + '%';
  cv.setAttribute('d', `M0 100C${P.p1.x} ${P.p1.y} ${P.p2.x} ${P.p2.y} 100 0`); ln.setAttribute('d', `M0 100L${P.p1.x} ${P.p1.y}M100 0L${P.p2.x} ${P.p2.y}`);
  out.textContent = css();
};
const css = () => `cubic-bezier(${(P.p1.x / 100).toFixed(2)}, ${(1 - P.p1.y / 100).toFixed(2)}, ${(P.p2.x / 100).toFixed(2)}, ${(1 - P.p2.y / 100).toFixed(2)})`;
const planes = ['#0061fe', '#fa551e', '#14c8eb', '#b4dc19', '#c8aff0']; let pi = 0;
const plane = document.querySelector('.plane');
[[h1, 'p1'], [h2, 'p2']].forEach(([el, k]) => {
  el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); el._d = true; });
  el.addEventListener('pointermove', (e) => {
    if (!el._d) return; const r = ed.getBoundingClientRect();
    P[k].x = clamp(((e.clientX - r.left) / r.width) * 100, 0, 100); P[k].y = clamp(((e.clientY - r.top) / r.height) * 100, -50, 150); draw();
  });
  el.addEventListener('pointerup', () => {
    el._d = false; if (reduced()) return;
    pi = (pi + 1) % planes.length; plane.querySelector('path').setAttribute('fill', planes[pi]);
    plane.style.transition = 'none'; plane.style.transform = 'translate(0,0)'; plane.offsetWidth;
    plane.style.transition = `transform 3s ${css()}`; plane.style.transform = 'translate(1600px,-600px)';
  });
});
draw();

/* keyframe lanes */
const lanes = [...document.querySelectorAll('.kl i')];
const seeds = lanes.map(() => ({ tx: (Math.random() > 0.5 ? 1 : -1) * 150, sx: 1 + Math.random() * 2, sk: (Math.random() - 0.5) * 50 }));
onFrame(() => {
  const sec = document.getElementById('mo4'), r = sec.getBoundingClientRect(), limit = innerHeight * 0.6;
  lanes.forEach((l, i) => {
    const s = seeds[i], ratio = reduced() ? 1 : easeOutQuad(clamp((innerHeight * 0.85 - r.top - 200 - (limit * 0.8 * i) / lanes.length) / limit));
    l.style.transformOrigin = s.tx === 150 ? 'center left' : 'center right';
    l.style.transform = `translateX(${s.tx * (1 - ratio)}%) scaleX(${1 + (s.sx - 1) * (1 - ratio)}) skewX(${s.sk * (1 - ratio)}deg)`;
  });
});

/* reel selector */
const sg = [...document.querySelectorAll('#mo5 .sg')], clips = [...document.querySelectorAll('.clip')];
sg.forEach((b, i) => b.addEventListener('click', () => { sg.forEach((x, j) => x.classList.toggle('on', j === i)); clips.forEach((c, j) => (c.style.display = j === i ? 'block' : 'none')); }));
clips.forEach((c, j) => (c.style.display = j === 0 ? 'block' : 'none'));
