/* Technique: three-column image block moves at different speeds (scrub) so the columns end up staggered:
   c1 y 0, c2 yPercent -18, c3 yPercent 10 across start "top bottom" -> end "bottom top".
   Full-bleed band: image sticky for 130vh; inner image translates -16vh (scrub) for depth. */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initParallax() {
  if (reduced) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const st = { trigger: '#tri', start: 'top bottom', end: 'bottom top', scrub: true };
    gsap.fromTo('.tri .c2', { yPercent: 6 }, { yPercent: -22, ease: 'none', scrollTrigger: st });
    gsap.fromTo('.tri .c3', { yPercent: 0 }, { yPercent: 12, ease: 'none', scrollTrigger: st });
  });
  gsap.fromTo('.band-img img', { yPercent: 0 }, { yPercent: -16, ease: 'none',
    scrollTrigger: { trigger: '#band', start: 'top bottom', end: 'bottom top', scrub: true } });
}
