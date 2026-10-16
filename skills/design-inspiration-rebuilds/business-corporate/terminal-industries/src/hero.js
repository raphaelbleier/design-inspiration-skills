/**
 * hero.js - one pinned, scrubbed GSAP timeline, 400vh of scroll (scrub: .6).
 *   0.00-0.25  truck plate scales 1 -> 1.12, hint fades, yard image wipes in from the right
 *              (clip-path inset(0 0 0 100%) -> inset(0)), power2.inOut
 *   0.20-0.60  particle scan progress 0 -> 1 (see particles.js), yard pushes in scale 1.18 -> 1
 *   0.55-0.75  black grid layer fades to 1 over the yard
 *   0.70-1.00  statement words fade .12 -> 1 one by one (stagger), then a short hold
 */
import { gsap, ScrollTrigger, SplitText, reduced } from './scroll.js';
import { initParticles } from './particles.js';

export function initHero() {
  const hero = document.querySelector('[data-hero]');
  const dark = hero.querySelector('[data-dark]');
  const split = SplitText.create(hero.querySelector('[data-statement] span'), { type: 'words', wordsClass: 'w' });
  if (reduced) { dark.style.opacity = 1; gsap.set(split.words, { opacity: 1 }); return; }

  const dots = initParticles(hero.querySelector('[data-dots]'));
  const state = { p: 0 };
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: hero, start: 'top top', end: '+=400%', pin: '.hero__stage', scrub: 0.6 },
  });
  tl.to('.hero__img--a img', { scale: 1.12 }, 0)
    .to('[data-scrollhint]', { opacity: 0, duration: 0.08 }, 0)
    .to('[data-yard]', { clipPath: 'inset(0 0 0 0%)', duration: 0.25, ease: 'power2.inOut' }, 0)
    .fromTo('[data-yard] img', { scale: 1.18 }, { scale: 1, duration: 0.6 }, 0)
    .to(state, { p: 1, duration: 0.4, onUpdate: () => (dots.progress = state.p) }, 0.2)
    .to(dark, { opacity: 1, duration: 0.2 }, 0.55)
    .to(split.words, { opacity: 1, stagger: 0.025, duration: 0.1 }, 0.7)
    .to({}, { duration: 0.1 }, 1);
}
