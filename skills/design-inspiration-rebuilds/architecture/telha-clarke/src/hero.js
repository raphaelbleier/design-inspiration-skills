/**
 * hero.js - full-bleed hero: the photo fills the first screen; the next section slides over it as you scroll.
 * Values: img yPercent 0 -> 18 and scale 1.12 -> 1 (scrub true, over the hero's own height), tagline and hint fade out in the first 30%.
 * Header logo is visible from the start; the header text blends with `difference` over image and paper.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initHero() {
  if (reduced) return;
  const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.timeline({ scrollTrigger: st })
    .to('.hero-img img', { yPercent: 18, scale: 1.12, ease: 'none' }, 0)
    .to(['.hint', '.tagline'], { opacity: 0, duration: 0.3, ease: 'none' }, 0);
}
