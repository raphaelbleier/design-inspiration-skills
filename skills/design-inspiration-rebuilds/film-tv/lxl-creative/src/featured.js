// Technique: auto-advancing featured carousel. Values from the original: 4 cards stacked with
// y = i*8, scale = 1 - i*0.05, zIndex = n - i (tween 0.6s osmo); the front card leaves by
// yPercent -110 with the "jump" ease. Background: next image sits underneath at scale 1.2 and the
// current one wipes away with clipPath inset(0 0 0 100%) (1.2s, power4.inOut) while the next settles to scale 1.
// 5s per slide, progress segments fill linearly.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initFeatured() {
  const sec = document.querySelector('[data-featured]');
  const bgs = [...sec.querySelectorAll('[data-f-bg]')];
  const cards = [...sec.querySelectorAll('[data-f-card]')];
  const segs = [...sec.querySelectorAll('[data-f-seg]')];
  const n = cards.length, STEP = 8, SCALE = 0.05, VISIBLE = 4, SLIDE = 5;
  let cur = 0, busy = false;

  gsap.set(bgs, { autoAlpha: (i) => (i === 0 ? 1 : 0), zIndex: (i) => (i === 0 ? 2 : 1) });
  const layout = (animate, skip) => cards.forEach((c, i) => {
    if (c === skip) return;
    const d = (i - cur + n) % n;
    const vars = { yPercent: 0, y: d * STEP, scale: 1 - d * SCALE, autoAlpha: d < VISIBLE ? 1 : 0, zIndex: n - d, pointerEvents: d === 0 ? 'auto' : 'none' };
    animate && !reduced ? gsap.to(c, { ...vars, duration: 0.6, ease: 'osmo', overwrite: 'auto' }) : gsap.set(c, vars);
  });
  layout(false);

  function go(next) {
    if (busy || next === cur) return;
    busy = true;
    const from = cur; cur = next;
    if (reduced) {
      gsap.set(bgs, { autoAlpha: 0 }); gsap.set(bgs[next], { autoAlpha: 1 });
      layout(false); busy = false; return;
    }
    const out = cards[from];
    gsap.to(out, { yPercent: -110, duration: 0.6, ease: 'jump', overwrite: 'auto', onComplete: () => layout(false) });
    layout(true, out);
    gsap.set(bgs[next], { autoAlpha: 1, zIndex: 1, clipPath: 'inset(0 0% 0 0)', scale: 1.2 });
    gsap.set(bgs[from], { zIndex: 2 });
    gsap.timeline({ onComplete: () => { gsap.set(bgs[from], { autoAlpha: 0, zIndex: 1 }); gsap.set(bgs[next], { zIndex: 2 }); busy = false; } })
      .to(bgs[from], { clipPath: 'inset(0 0 0 100%)', duration: 1.2, ease: 'power4.inOut' })
      .to(bgs[next], { scale: 1, duration: 1.2, ease: 'power4.inOut' }, 0);
  }

  const p = { v: 0 };
  const fill = gsap.to(p, { v: 1, duration: SLIDE, ease: 'none', paused: true,
    onUpdate: () => segs[cur].style.setProperty('--p', p.v),
    onComplete: () => { go((cur + 1) % n); run(); } });
  function run() {
    segs.forEach((s, i) => s.style.setProperty('--p', i < cur ? 1 : 0));
    p.v = 0; fill.restart();
  }
  segs.forEach((s, i) => s.addEventListener('click', () => { go(i); run(); }));
  if (reduced) { segs[0].style.setProperty('--p', 1); return; }
  ScrollTrigger.create({ trigger: sec, start: 'top 80%', end: 'bottom 20%', onEnter: run, onEnterBack: () => fill.play(), onLeave: () => fill.pause(), onLeaveBack: () => fill.pause() });
}
