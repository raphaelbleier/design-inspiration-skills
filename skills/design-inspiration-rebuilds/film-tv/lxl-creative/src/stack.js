// Technique: pinned card stack (position: sticky + scrubbed timeline, perspective 1200px).
// Cards sit in slots: slot k = y +30*k, z -30*k (max 3 visible). Each stage the front card is thrown up
// (yPercent -80, y -50vh, scale 1.2, random rotation +-25deg, power4.in) while every card behind
// steps forward one slot (back.inOut(3)). scrub 0.5 on the whole timeline.
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

export function initStack() {
  const sec = document.querySelector('[data-stack]');
  const items = [...sec.querySelectorAll('[data-stack-item]')];
  const n = items.length, gap = 30, slot = (k) => ({ y: gap * Math.min(k, 3), z: -gap * Math.min(k, 3) });
  if (reduced) {   // static grid, no pin
    sec.style.height = 'auto';
    sec.querySelector('[data-stack-pin]').style.cssText = 'position:static;height:auto;padding:6rem var(--gutter)';
    sec.querySelector('[data-stack-cards]').style.cssText += ';display:grid;gap:1rem;width:min(22rem,90%);aspect-ratio:auto';
    items.forEach((el) => (el.style.cssText = 'position:relative;aspect-ratio:412/514'));
    return;
  }
  items.forEach((el, i) => gsap.set(el, { zIndex: n - i, ...slot(i), autoAlpha: i < 4 ? 1 : 0 }));
  const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.5 } });
  for (let s = 0; s < n - 1; s++) {
    tl.to(items[s], { yPercent: -80, y: '-50vh', scale: 1.2, rotation: (Math.random() - 0.5) * 50, ease: 'power4.in', duration: 1 }, s);
    items.slice(s + 1).forEach((el, k) => tl.to(el, { ...slot(k), autoAlpha: 1, ease: 'back.inOut(3)', duration: 1 }, s + 0.35));
  }
  tl.to({}, { duration: 0.4 });   // hold on the last card
}
