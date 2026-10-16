/* Technique: Lenis smooth scroll driven by the GSAP ticker.
   Values: lerp .09, smoothWheel, autoRaf off, lagSmoothing(0). Stopped while the gate/menu is open. */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export let lenis = null;

export function initScroll() {
  gsap.registerPlugin(ScrollTrigger);
  if (reduced) return;
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true, autoRaf: false });
  lenis.stop();                                   // gate is up
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));    // gsap seconds -> lenis ms
  gsap.ticker.lagSmoothing(0);
}
