// Technique: Lenis smooth scroll driven by the GSAP ticker (one frame loop for scroll, ScrollTrigger, WebGL).
// Values: lerp .1, lagSmoothing(0). Disabled under prefers-reduced-motion.
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export let lenis = null;
const frame = [];
export const onFrame = (fn) => frame.push(fn);

export function initScroll() {
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
  }
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((t) => {
    if (lenis) lenis.raf(t * 1000);
    frame.forEach((fn) => fn(t));
  });
}
