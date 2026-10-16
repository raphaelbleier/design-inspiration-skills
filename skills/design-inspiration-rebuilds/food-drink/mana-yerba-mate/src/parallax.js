/**
 * parallax.js - duo images translate -100px -> 0 over their section (scrubbed),
 * feed photos drift by data-speed * 100vh-ish (yPercent scrub).
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initParallax() {
  if (reduced) return;
  gsap.utils.toArray('.duo .parallax').forEach((el) => {
    gsap.fromTo(el, { y: -100 }, { y: 0, ease: 'none', scrollTrigger: { trigger: '.duo', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.utils.toArray('.ph').forEach((el) => {
    gsap.fromTo(el, { yPercent: 25 * -parseFloat(el.dataset.speed) * 2 }, { yPercent: 130 * parseFloat(el.dataset.speed), ease: 'none',
      scrollTrigger: { trigger: '.feed', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}
