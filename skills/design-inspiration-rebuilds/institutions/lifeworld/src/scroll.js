/**
 * scroll.js - Lenis smooth scroll driven by the GSAP ticker.
 * Technique: autoRaf false, lenis.raf() called from gsap.ticker, lenis scroll event feeds
 * ScrollTrigger.update, lagSmoothing(0). Values: lerp .1, smoothWheel, syncTouch.
 * Reduced motion: no smooth scroll.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export let lenis = null;

export function initScroll() {
  if (reduced) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: true, touchMultiplier: 2, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));   // gsap time is seconds, lenis wants ms
  gsap.ticker.lagSmoothing(0);
}

export function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}
