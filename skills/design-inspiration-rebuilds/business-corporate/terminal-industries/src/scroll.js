/**
 * scroll.js - Lenis smooth scroll driven by the GSAP ticker.
 * lerp .1 (~ the feel of the original), autoRaf off: one frame loop for Lenis,
 * ScrollTrigger and the WebGL dots. lagSmoothing(0) so pins never "catch up".
 * Reduced motion: native scroll.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);
export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const frame = new Set();
let lenis = null;

export function initScroll() {
  gsap.ticker.lagSmoothing(0);
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
  }
  gsap.ticker.add((t) => { if (lenis) lenis.raf(t * 1000); frame.forEach((fn) => fn(t)); });
}
export const onFrame = (fn) => { frame.add(fn); return () => frame.delete(fn); };
export const scrollTo = (y) => (lenis ? lenis.scrollTo(y) : window.scrollTo(0, y));
export { gsap, ScrollTrigger, SplitText };
