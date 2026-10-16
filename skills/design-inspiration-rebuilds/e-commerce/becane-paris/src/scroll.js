// Technique: Lenis smooth scroll driven by the GSAP ticker (one frame loop for scroll,
// ScrollTrigger and WebGL). Values: lerp .1, lagSmoothing(0).
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const frameCallbacks = new Set();
export const onFrame = (fn) => frameCallbacks.add(fn);

export function initScroll() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lenis = reduce ? null : new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
  lenis?.on('scroll', ScrollTrigger.update);
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((t) => { lenis?.raf(t * 1000); frameCallbacks.forEach((fn) => fn(t)); });
  return lenis;
}
