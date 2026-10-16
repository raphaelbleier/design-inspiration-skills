/**
 * accordion.js - FAQ rows. Panel height 0 <-> auto via gsap, 0.55s power3.inOut;
 * one row open at a time; the plus morphs to a minus with a CSS transform (.5s, cubic-bezier(.76,0,.24,1)).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function accordion() {
  const rows = [...document.querySelectorAll('.acc__i')];
  const set = (row, open) => {
    const b = row.querySelector('.acc__b');
    b.setAttribute('aria-expanded', open);
    gsap.to(row.querySelector('.acc__p'), { height: open ? 'auto' : 0, duration: reduced ? 0 : 0.55, ease: 'power3.inOut',
      onComplete: () => ScrollTrigger.refresh() });
  };
  rows.forEach((row) => row.querySelector('.acc__b').addEventListener('click', () => {
    const open = row.querySelector('.acc__b').getAttribute('aria-expanded') !== 'true';
    rows.forEach((r) => r !== row && set(r, false));
    set(row, open);
  }));
  if (!reduced) gsap.from('.acc__i', { opacity: 0, y: 24, duration: 0.8, ease: 'power3.out', stagger: 0.08,
    scrollTrigger: { trigger: '.acc', start: 'top 85%', once: true } });
}
