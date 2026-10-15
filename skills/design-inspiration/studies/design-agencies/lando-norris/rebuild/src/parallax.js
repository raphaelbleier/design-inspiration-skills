/**
 * parallax.js - [data-parallax="-8"] = element drifts by that many vh across the viewport (scrubbed);
 * [data-parallax-img] = full-bleed image: inner <img> slides while the wrapper reveals.
 */
import { gsap, reduced } from './scroll.js';

export function initParallax() {
  if (reduced) return;
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const d = parseFloat(el.dataset.parallax);
    gsap.fromTo(el, { yPercent: -d * 2 }, { yPercent: d * 2, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  document.querySelectorAll('[data-parallax-img]').forEach((el) => {
    const img = el.querySelector('img');
    gsap.set(el, { clipPath: 'ellipse(60% 0% at 50% 100%)' });
    gsap.to(el, { clipPath: 'ellipse(120% 140% at 50% 100%)', ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 30%', scrub: true } });
    gsap.fromTo(img, { yPercent: -8, scale: 1.12 }, { yPercent: 8, scale: 1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}
