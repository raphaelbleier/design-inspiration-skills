/**
 * fan.js - social card fan. Cards start stacked in the centre; when the section enters they
 * fan out on an arc with elastic.out(1, .75) over .5s (stagger from the centre). Hover lifts a card.
 */
import { gsap, ScrollTrigger, reduced } from './scroll.js';

const cards = ['g-main', 'g-smile', 'g-walk', 'g-camera', 'g-prize', 'g-helmet', 'g-gala'];

export function initFan() {
  const fan = document.querySelector('[data-fan]');
  fan.innerHTML = cards.map((n, i) => `<a class="fan__card" href="#" aria-label="Social post ${i + 1}"><img src="./img/${n}.webp" alt="" loading="lazy"></a>`).join('');
  const els = [...fan.children];
  const mid = (els.length - 1) / 2;
  const small = () => window.innerWidth < 480;

  // the fan pose of card i
  const pose = (i) => {
    const k = i - mid;
        return { rotation: k * 9, xPercent: k * (small() ? 24 : 40), y: Math.abs(k) ** 2 * (small() ? 5 : 14) };
  };
  const stacked = { rotation: 0, xPercent: 0, y: 0 };

  els.forEach((el, i) => gsap.set(el, { ...(reduced ? pose(i) : stacked), zIndex: 10 - Math.abs(i - mid) }));
  if (reduced) return;

  ScrollTrigger.create({
    trigger: fan, start: 'top 80%', once: true,
    onEnter: () => els.forEach((el, i) => gsap.to(el, { ...pose(i), duration: 0.5, ease: 'elastic.out(1, .75)', delay: Math.abs(i - mid) * 0.06 })),
  });
  els.forEach((el, i) => {
    el.addEventListener('pointerenter', () => gsap.to(el, { ...pose(i), y: pose(i).y - 24, scale: 1.05, zIndex: 20, duration: 0.5, ease: 'elastic.out(1, .75)', overwrite: 'auto' }));
    el.addEventListener('pointerleave', () => gsap.to(el, { ...pose(i), scale: 1, zIndex: 10 - Math.abs(i - mid), duration: 0.5, ease: 'elastic.out(1, .75)', overwrite: 'auto' }));
  });
}
