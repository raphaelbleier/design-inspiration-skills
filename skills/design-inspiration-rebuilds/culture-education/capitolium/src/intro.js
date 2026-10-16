/* Technique: pinned hero (CSS sticky inside a 320vh section) scrubbed by one timeline.
   0 -> .22  text fades in over the dark facade
   .45 -> .85 facade clip-path inset(0) -> inset(22% 30% 22% 30%): the full-bleed photo shrinks into a framed card on cream; text fades out
   Scrub is 0.6s smoothed. */
import { gsap } from 'gsap';

export function initIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.intro', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
  tl.fromTo('#introTxt', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.22 })
    .fromTo('#introImg img', { scale: 1.15 }, { scale: 1, duration: 1 }, 0)
    .to('#introTxt', { opacity: 0, duration: 0.15 }, 0.5)
    .fromTo('#introImg', { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(22% 30% 22% 30%)', ease: 'power2.inOut', duration: 0.4 }, 0.45)
    .to('.scrollhint', { opacity: 0, duration: 0.1 }, 0.05);
}
