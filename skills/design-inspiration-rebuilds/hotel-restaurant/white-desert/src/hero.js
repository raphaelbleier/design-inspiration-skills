/* Pinned hero (CSS sticky, 260vh track), scrubbed with scrub: .6.
   0 -> .45  crevasse image scales 1 -> 1.3 and blurs 0 -> 10px, giant word drifts up and fades to .35
   .2 -> .8  mist layer rises (translateY 30% -> -10%) and opacity 0 -> 1 until the frame is white
   .3 -> .7  second image (cabin window) cross-fades in under the mist
   Each letter has its own yPercent offset so the word tears slightly as it scrolls. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHero() {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    defaults: { ease: 'none' },
  });
  tl.to('.hero__a', { scale: 1.3, filter: 'blur(10px)', duration: 0.45 }, 0)
    .to('.hero__b', { opacity: 1, duration: 0.4 }, 0.3)
    .to('.hero__tag, .film', { opacity: 0, duration: 0.2 }, 0)
    .fromTo('#mist', { opacity: 0, yPercent: 30 }, { opacity: 1, yPercent: -10, duration: 0.6 }, 0.2)
    .to('#word span', { yPercent: (i) => -12 - (i % 3) * 8, opacity: 0.35, duration: 0.45, stagger: 0.01 }, 0)
    .to('#word', { opacity: 0, duration: 0.2 }, 0.8)
    .to('.hero__pin', { backgroundColor: '#fff', duration: 0.2 }, 0.8);
  ScrollTrigger.refresh();
}
