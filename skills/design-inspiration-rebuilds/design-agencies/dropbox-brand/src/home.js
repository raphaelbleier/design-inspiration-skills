/*
 * Home = the menu. Native scroll over a 300vh runway; no smooth-scroll library, no WebGL.
 * Technique, per frame (rAF-throttled scroll handler):
 *   progress = scrollY / (docHeight - innerHeight);  e = cubicBezier(1, .25, .85, 1)(progress)
 *   - tiles: scale 2 -> 1 and a fly-in translate along per-tile vectors (see tiles.js layoutTiles)
 *   - centre button, three states:
 *       1  e <= 0           white square min(800, min(vw,vh)-64), headline 1, 1px blue border
 *       2  e < breakpoint   blue 500px square, headline 2   (breakpoint = .05 + max(vw,vh)/5000)
 *       3  e >= breakpoint  linear shrink 500px -> 90px (64px mobile); headline scales 1 - p*.9;
 *                           a 0.3s catch-up transition covers the first 0.1 of state-3 progress
 *   - tiles become interactive (inert removed) only when e > .95; hairlines fade between .95 and 1
 * Load-in (class .animating-in, then .final at DOMContentLoaded) is pure CSS: see styles/home.css.
 * Scroll is locked until 1800ms, `animating-in` is dropped at 3000ms, chevrons appear at 2500ms and pulse every 2500ms.
 * Overshoot helper: stop scrolling within 200px of the end (250ms debounce) and the page glides to the bottom.
 */
import './styles/tokens.css';
import './styles/base.css';
import './styles/tiles.css';
import './styles/home.css';
import { markSVG } from './brandmark.js';
import { buildNav, layoutTiles } from './tiles.js';
import { homeCurve, clamp, reduced } from './easing.js';

history.scrollRestoration = 'manual';
document.body.classList.add('home');
document.documentElement.classList.add('home-nav');
const body = document.body;
const root = document.getElementById('tiles-root');
root.className = 'nav-tiles';
const units = buildNav(root, { withLines: true });
root.insertAdjacentHTML('beforeend', '<i class="btn-slot"></i>');
const slot = root.querySelector('.btn-slot');
const btn = document.querySelector('.hbtn');
const lines = document.querySelector('.home-lines');
lines.innerHTML = '<i class="hz h1"></i><i class="hz h2"></i><i class="hz h3"></i><i class="hz h4"></i><i class="vt v1"></i><i class="vt v2"></i><i class="vt v3"></i><i class="vt v4"></i>';
const chev = document.querySelector('.chevrons');
btn.insertAdjacentHTML('beforeend', markSVG());

const lerp = (a, b, t) => a + (b - a) * t;
let lastState = 0;
function frame() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const raw = max > 0 ? clamp(scrollY / max) : 0;
  const e = homeCurve(raw);
  layoutTiles(units, e);
  const mobileBtn = innerWidth <= 991, bMin = mobileBtn ? 64 : 90;
  const S1 = Math.min(800, Math.min(innerWidth, innerHeight) - 64);
  const S2 = Math.min(500, S1);
  const sb = 0.05 + Math.max(innerWidth, innerHeight) / 5000;
  let size, state, p3 = 0;
  if (e <= 0) { size = S1; state = 1; }
  else if (e < sb) { size = S2; state = 2; }
  else { p3 = (e - sb) / (1 - sb); size = lerp(S2, bMin, p3); state = 3; }
  btn.classList.toggle('s2', state >= 2); btn.classList.toggle('s3', state === 3);
  btn.classList.toggle('final-ui', p3 > 0.98);
  btn.style.width = btn.style.height = size + 'px';
  btn.style.transition = state === 3 ? (p3 < 0.1 ? 'width .3s cubic-bezier(0,.8,.4,1), height .3s cubic-bezier(0,.8,.4,1), background-color .3s, color .3s' : 'background-color .3s, color .3s, border-radius .3s') : '';
  // on mobile the final slot is not the screen centre: drift towards it as the button shrinks
  const sr = slot.getBoundingClientRect(), dx = sr.left + sr.width / 2 - innerWidth / 2, dy = sr.top + sr.height / 2 - innerHeight / 2;
  btn.style.translate = `calc(-50% + ${dx * p3}px) calc(-50% + ${dy * p3}px)`;
  btn.querySelector('.hbtn-titles').style.opacity = state === 3 ? Math.max(0, 1 - p3 * 2) : '';
  btn.querySelectorAll('.hbtn-title').forEach((t) => (t.style.transform = `scale(${1 - p3 * 0.9})`));
  btn.style.border = state === 3 && p3 > 0.5 ? '0' : '';
  const gl = clamp((e - 0.95) / 0.05);
  units.forEach((u) => u.querySelectorAll('.gl').forEach((l) => (l.style.opacity = 1 - gl)));
  const live = e > 0.95;
  units.forEach((u) => { const t = u.querySelector('.tile'); if (t.inert === live) t.inert = !live; });
  root.style.visibility = e > 0.001 ? 'visible' : 'hidden';   // nothing but the white button before the first scroll
  lines.classList.toggle('gone', e > 0);
  chev.classList.toggle('off', e > 0);
  if (state !== lastState) lastState = state;
}
let ticking = false;
const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; frame(); }); } };
addEventListener('scroll', req, { passive: true });
addEventListener('resize', req);
frame();

// snap to the bottom when the user stops near the end
let idle;
addEventListener('scroll', () => {
  clearTimeout(idle);
  idle = setTimeout(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (max - scrollY > 0 && max - scrollY < 200) scrollTo({ top: max, behavior: 'smooth' });
  }, 250);
}, { passive: true });

// load-in choreography
const rm = reduced();
function final() { body.classList.add('final'); }
if (rm) { body.classList.remove('animating-in'); body.classList.add('final'); chev.classList.add('show'); }
else {
  body.style.overflow = 'hidden';
  requestAnimationFrame(() => requestAnimationFrame(final));
  setTimeout(() => (body.style.overflow = ''), 1800);
  setTimeout(() => body.classList.remove('animating-in'), 3000);
  setTimeout(() => chev.classList.add('show'), 2500);
}
function pulse() {
  [...chev.children].forEach((c, i) => setTimeout(() => {
    c.classList.add('activated'); setTimeout(() => c.classList.remove('activated'), 300);
  }, i * 75));
}
if (!rm) { setTimeout(() => { pulse(); setInterval(pulse, 2500); }, 3000); }
