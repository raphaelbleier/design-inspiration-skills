/**
 * scroll.js - Lenis smooth scroll driven by the GSAP ticker.
 * Technique: autoRaf:false, lenis.raf() called from gsap.ticker, lagSmoothing(0),
 * lenis.on('scroll', ScrollTrigger.update). Values: lerp .1, smoothWheel, syncTouch.
 * Reduced motion: no Lenis at all (native scroll).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initScroll() {
  if (reduced) return null;
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: true, touchMultiplier: 2, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
