// Hero slit. Technique: headline split in two halves around a 0.6vw slit (a flex column).
// A pinned ScrollTrigger (scrub 1, end +=130%) grows the slit to 50vh; the flex column pushes
// the text lines apart on its own. The still scales 1.35 -> 1 inside the window.
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

export function initHero() {
  const frame = document.querySelector('.hero-frame');
  const img = frame.querySelector('img');
  if (reduced) { frame.style.height = '50vh'; return; }
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=130%', pin: '.hero-inner', scrub: 1 },
  });
  tl.fromTo(frame, { height: () => innerWidth * 0.006 }, { height: () => innerHeight * (innerWidth > 767 ? 0.5 : 0.36), ease: 'none' }, 0)
    .fromTo(img, { scale: 1.35 }, { scale: 1, ease: 'none' }, 0);
  gsap.from('.hero-line', { yPercent: 40, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.15, delay: 0.1 });
}
