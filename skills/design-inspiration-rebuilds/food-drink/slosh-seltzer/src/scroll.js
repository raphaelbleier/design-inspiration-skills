/**
 * scroll.js - Lenis driven by the GSAP ticker (one frame loop for scroll, ScrollTrigger and WebGL).
 * Technique: Lenis { lerp: .1, smoothWheel, syncTouch }, autoRaf:false, gsap.ticker.lagSmoothing(0).
 * Reduced motion: no Lenis at all, native scrolling.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { reduced } from './state.js';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;
const frameCallbacks = new Set();

export function initScroll() {
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: true, touchMultiplier: 2, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    lenis.stop();                                   // locked until the age gate is passed
  }
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((time) => {
    if (lenis) lenis.raf(time * 1000);
    frameCallbacks.forEach((fn) => fn(time));
  });
}

export const onFrame = (fn) => frameCallbacks.add(fn);
export const unlock = () => { lenis?.start(); document.body.classList.remove('locked'); };
export const scrollTo = (target, opts = {}) => {
  if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
  else (typeof target === 'number' ? window.scrollTo(0, target) : target.scrollIntoView({ behavior: 'smooth' }));
};
