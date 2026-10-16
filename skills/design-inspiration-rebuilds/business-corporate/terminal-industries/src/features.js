/**
 * features.js - pinned 3-step feature block (+=300%, scrub 0.5).
 * Progress p picks the active step (floor(p*3)); text swaps with a .6s power3.out rise,
 * the panel crossfades images (.8s in CSS) and the chip text changes. A lime bar under
 * the panel is scaleX = p.
 */
import { gsap, ScrollTrigger, reduced } from './scroll.js';

const CHIPS = ['Plate read: 98.7%', 'Assign to spot 11', 'Door 9 re-planned: +4 min'];

export function initFeatures() {
  const root = document.querySelector('[data-feat]');
  if (reduced) return;
  const steps = [...root.querySelectorAll('[data-step]')];
  const imgs = [...root.querySelectorAll('.feat__img')];
  const chip = root.querySelector('[data-chip]');
  const bar = root.querySelector('[data-bar]');
  let cur = -1;

  const show = (i) => {
    if (i === cur) return;
    steps.forEach((s, k) => gsap.to(s, k === i
      ? { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.15, overwrite: true }
      : { opacity: 0, y: k < i ? -30 : 30, duration: 0.4, ease: 'power3.in', overwrite: true }));
    imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
    gsap.fromTo(chip, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    chip.textContent = CHIPS[i];
    cur = i;
  };
  show(0);
  ScrollTrigger.create({
    trigger: root, start: 'top top', end: '+=300%', pin: '.feat__pin', scrub: 0.5,
    onUpdate: (self) => { show(Math.min(2, Math.floor(self.progress * 3))); gsap.set(bar, { scaleX: self.progress }); },
  });
}
