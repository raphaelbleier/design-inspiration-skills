/* Smooth scroll: Lenis driven by the GSAP ticker (one frame loop for scroll, ScrollTrigger and WebGL).
 * Values: lerp .1, smoothWheel, syncTouch off (native touch scroll is kept), lagSmoothing(0). */
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export let lenis = null;
const frameCallbacks = [];
export const onFrame = (fn) => frameCallbacks.push(fn);

export function initScroll(reduced) {
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    lenis.stop();                                   // locked until the age gate is passed
  }
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((time) => {
    if (lenis) lenis.raf(time * 1000);
    frameCallbacks.forEach((fn) => fn(time));
  });
}
