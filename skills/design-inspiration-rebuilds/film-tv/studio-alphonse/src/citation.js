// Citation. Technique: two stacked copies of the same line, filled and outlined (-webkit-text-stroke 2px),
// scrubbed in opposite directions while the section crosses the viewport: fill 0 -> -35%, stroke -35% -> 0.
import { gsap } from 'gsap';
import { reduced } from './scroll.js';

export function initCitation() {
  if (reduced) return;
  const st = { trigger: '.citation', start: 'top bottom', end: 'bottom top', scrub: 1 };
  gsap.fromTo('.cit-fill', { xPercent: 0 }, { xPercent: -35, ease: 'none', scrollTrigger: st });
  gsap.fromTo('.cit-stroke', { xPercent: -35 }, { xPercent: 0, ease: 'none', scrollTrigger: st });
}
