// Technique: Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger and WebGL share one frame loop.
// Values: lerp .1, lagSmoothing(0). Disabled under prefers-reduced-motion.
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
export const frame = [];
export function initScroll() {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
  }
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((t) => { lenis?.raf(t * 1000); frame.forEach((fn) => fn(t)); });
  return lenis;
}
