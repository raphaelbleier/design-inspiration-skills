/**
 * parallax.js - [data-speed] figures: the image inside translates yPercent +-(speed*100)
 * while its frame scrolls through the viewport (scrub 0.6), image pre-scaled 1.18 so no gaps.
 * Mirrors the original's data-parallax attributes with ScrollTrigger scrub.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initParallax() {
  if (reduced) return;
  gsap.utils.toArray('[data-speed]').forEach((fig) => {
    const s = parseFloat(fig.dataset.speed) * 100;
    const img = fig.querySelector('img');
    if (!img) return;
    gsap.fromTo(img, { yPercent: -s }, { yPercent: s, ease: 'none',
      scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  });
}
