/* Smooth scroll: Lenis { lerp: .1, smoothWheel } driven by gsap.ticker (one frame loop for scroll + ScrollTrigger + WebGL).
   Disabled under prefers-reduced-motion. */
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export let lenis = null;
const frames = new Set();
export const onFrame = (fn) => (frames.add(fn), () => frames.delete(fn));

export function initScroll() {
  gsap.ticker.lagSmoothing(0);
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
  }
  gsap.ticker.add((t) => { lenis?.raf(t * 1000); frames.forEach((f) => f(t)); });
}
