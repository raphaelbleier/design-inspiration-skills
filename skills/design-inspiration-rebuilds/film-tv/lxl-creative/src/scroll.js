// Technique: Lenis smooth scroll driven by the GSAP ticker, as in the original.
// Exact values: new Lenis({ lerp: 0.165, wheelMultiplier: 1.25 }); gsap.ticker.lagSmoothing(0).
// Also registers the "osmo" (0.625,0.05,0,1) and "jump" (overshoot) eases used by every UI tween.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create('osmo', '0.625, 0.05, 0, 1');
CustomEase.create('jump', 'M0,0 C0.35,1.5 0.6,1 1,1');

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initScroll() {
  if (reduced) return null;
  const lenis = new Lenis({ lerp: 0.165, wheelMultiplier: 1.25 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));   // gsap time is seconds, lenis wants ms
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
