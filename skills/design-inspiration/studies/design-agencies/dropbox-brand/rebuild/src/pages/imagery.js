/*
 * Imagery.
 *  - im1 (300vh sticky): curtain-wipe reveal. A cover element shrinks from full width to 0 as progress runs, shaped by
 *    easeInOutQuint (t<0.5: 0.5*(2t)^5, otherwise mirrored). offset = 0.4*innerHeight, end = height - offset,
 *    so the wipe starts before the stage is even pinned.
 *  - im2: four card sets cross-fade every 3000ms with a 150ms stagger per set (off under reduced motion)
 *  - im3: images can be dragged and resized with corner handles; the bounding box shows on hover
 *  - im4: a draggable carousel with momentum; each card scales by pow(factor, 2.25), factor = max(0, 1 - distance/innerWidth)
 */
import '../shell.js';
import '../styles/pages.css';
import { onFrame } from '../fx/scroll.js';
import { dragScroller } from '../fx/drag-scroller.js';
import { easeInOutQuint, clamp, reduced } from '../easing.js';

const im1 = document.getElementById('im1'), curtain = im1.querySelector('.curtain');
onFrame(() => {
  const r = im1.getBoundingClientRect(), offset = 0.4 * innerHeight, end = r.height - offset;
  const p = reduced() ? 1 : clamp((offset - r.top) / (end - innerHeight * 0.1));
  const e = easeInOutQuint(p);
  if (innerWidth < 768) curtain.style.cssText = `height:${(1 - e) * 100}%;width:100%`; else curtain.style.cssText = `width:${(1 - e) * 100}%;height:100%`;
});

if (!reduced()) {
  const sets = [...document.querySelectorAll('.cs')];
  let tick = 0;
  setInterval(() => {
    tick++;
    sets.forEach((s, i) => setTimeout(() => {
      const imgs = [...s.children], cur = imgs.findIndex((x) => x.classList.contains('on'));
      imgs[cur].classList.remove('on'); imgs[(cur + 1) % imgs.length].classList.add('on');
    }, i * 150));
  }, 3000);
}

document.querySelectorAll('.rz').forEach((box) => {
  const area = box.parentElement;
  let mode = null, sx, sy, sr;
  box.addEventListener('pointerdown', (e) => {
    mode = e.target.classList.contains('h') ? e.target.classList[1] : 'move';
    const a = area.getBoundingClientRect(), b = box.getBoundingClientRect();
    sx = e.clientX; sy = e.clientY; sr = { l: b.left - a.left, t: b.top - a.top, w: b.width, h: b.height, aw: a.width, ah: a.height };
    box.setPointerCapture(e.pointerId); box.classList.add('sel'); e.preventDefault();
  });
  box.addEventListener('pointermove', (e) => {
    if (!mode) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; let { l, t, w, h } = sr;
    if (mode === 'move') { l += dx; t += dy; }
    else {
      if (mode.includes('e')) w += dx; if (mode.includes('s')) h += dy;
      if (mode.includes('w')) { w -= dx; l += dx; } if (mode.includes('n')) { h -= dy; t += dy; }
    }
    w = Math.max(80, w); h = Math.max(80, h);
    l = clamp(l, 0, sr.aw - w); t = clamp(t, 0, sr.ah - h);
    Object.assign(box.style, { left: l + 'px', top: t + 'px', width: w + 'px', height: h + 'px' });
  });
  box.addEventListener('pointerup', () => { mode = null; });
});

const car = document.querySelector('.carousel'), track = car.querySelector('.car-track'), cards = [...track.children];
const bounds = () => [Math.min(0, innerWidth - track.scrollWidth - 120), 0];
const d = dragScroller(car, { onMove: (x) => { const b = bounds(); const v = clamp(x, b[0], b[1]); track.style.transform = `translateX(${v}px)`; scale(); } });
function scale() {
  const mid = innerWidth / 2;
  cards.forEach((c) => {
    const r = c.getBoundingClientRect(), dist = Math.abs(r.left + r.width / 2 - mid), f = Math.max(0, 1 - dist / innerWidth);
    const s = 0.72 + 0.28 * Math.pow(f, 2.25) / 1; c.style.transform = `scale(${Math.min(1, s * 1.18)})`;
    c.classList.toggle('mid', dist < r.width * 0.6);
  });
}
addEventListener('resize', scale); scale(); onFrame(scale);
