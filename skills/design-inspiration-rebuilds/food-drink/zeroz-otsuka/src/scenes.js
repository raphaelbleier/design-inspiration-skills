/* "All scenes" list: each photo row opens with clip-path inset(0 0 100% 0) -> inset(0) (.9s
   power3.inOut) when it reaches 85% of the viewport; the image inside settles 1.2 -> 1 (scrubbed). */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initScenes() {
  if (reduced) return;
  gsap.utils.toArray('.scene').forEach((el) => {
    gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    gsap.to(el.querySelector('img'), { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}
