/**
 * parallax.js - every [data-px] image sits in a frame with inset -8% 0 / height 116%.
 * Scrubbed yPercent -7 -> 7 (linear, scrub true) while the frame crosses the viewport.
 * Frames also scale-reveal: image scale 1.25 -> 1 over 1.3s power3.out when they enter at 90%.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function parallax() {
  if (reduced) return;
  document.querySelectorAll('[data-px]').forEach((img) => {
    const frame = img.parentElement.closest('.px');
    gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
    if (frame.closest('.hero')) return;
    gsap.from(frame, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power3.inOut',
      scrollTrigger: { trigger: frame, start: 'top 90%', once: true } });
  });
  ScrollTrigger.refresh();
}
