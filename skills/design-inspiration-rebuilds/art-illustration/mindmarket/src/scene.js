/* Colour-flood scene: pinned 100svh section (#scene). A cream circle (140vmax) scales .18 -> 1 from 60% height, scrubbed,
   flooding the green. Characters drift upward at individual speeds (data-speed * 18vh) and the white card
   rises from below the fold (yPercent 100 -> 0). */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initScene() {
  const stage = document.querySelector('.stage');
  if (reduced) { gsap.set('.blob', { scale: 1 }); return; }
  const tl = gsap.timeline({ defaults: { ease: 'none' },
    scrollTrigger: { trigger: '#scene', start: 'top top', end: '+=180%', scrub: 0.6, pin: true } });
  tl.fromTo('.blob', { scale: 0.18 }, { scale: 1, ease: 'power2.in', duration: 1 }, 0)
    .fromTo('.card', { yPercent: 100 }, { yPercent: 0, ease: 'power3.out', duration: 0.6 }, 0.4);
  stage.querySelectorAll('.fl').forEach((f) => {
    const s = +f.dataset.speed;
    tl.fromTo(f, { y: () => innerHeight * 0.45 * s, rotate: -8 * s },
      { y: () => -innerHeight * 0.18 * s, rotate: 6 * s, duration: 1 }, 0);
  });
}
