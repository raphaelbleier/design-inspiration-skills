/**
 * works.js - selected works: each project image opens from a thin line (clip-path inset 0 0 94% 0 -> 0, scrub),
 * image parallax yPercent 12 -> -12, and the square brackets around the title spread apart
 * (--spread 0 -> 1 = 5vw each side) as the title crosses the viewport centre. Title scales with scrub.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initWorks() {
  if (reduced) { document.querySelectorAll('.work-title').forEach((t) => t.style.setProperty('--spread', 1)); return; }
  gsap.utils.toArray('.work').forEach((w) => {
    const img = w.querySelector('.work-img');
    const title = w.querySelector('.work-title');
    gsap.fromTo(img, { clipPath: 'inset(0% 0% 94% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
      scrollTrigger: { trigger: w, start: 'top 85%', end: 'top 35%', scrub: 0.5 } });
    gsap.fromTo(img.querySelector('img'), { yPercent: 12 }, { yPercent: -12, ease: 'none',
      scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(title, { '--spread': 0 }, { '--spread': 1, ease: 'none',
      scrollTrigger: { trigger: title, start: 'top 95%', end: 'top 45%', scrub: 0.5 } });
  });
}
