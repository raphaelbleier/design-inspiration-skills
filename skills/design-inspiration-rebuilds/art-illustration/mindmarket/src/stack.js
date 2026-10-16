/* Sticky card stack: each .nc is position:sticky at top 7rem; as the next card slides over, the covered one
   scales .94 and tilts -2deg (scrubbed over the next card's travel). */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initStack() {
  if (reduced) return;
  const cards = gsap.utils.toArray('.nc');
  cards.slice(0, -1).forEach((c, i) => {
    gsap.to(c, { scale: 0.94, rotate: -2, ease: 'none',
      scrollTrigger: { trigger: cards[i + 1], start: 'top 85%', end: 'top 15%', scrub: true } });
  });
}
