/* Technique: Lenis smooth scroll driven by the GSAP ticker (one frame loop for scroll, ScrollTrigger and WebGL).
   Values: lerp .09, lagSmoothing(0). Disabled under prefers-reduced-motion. */
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const frameCallbacks = new Set();
export let lenis = null;

export function initScroll() {
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
  }
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((t) => {
    if (lenis) lenis.raf(t * 1000);
    frameCallbacks.forEach((fn) => fn(t));
  });
}
