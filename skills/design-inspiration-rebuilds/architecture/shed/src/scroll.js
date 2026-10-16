/**
 * scroll.js - Lenis smooth scroll driven by the GSAP ticker.
 * Technique: autoRaf:false, gsap.ticker calls lenis.raf(time*1000), lenis 'scroll' -> ScrollTrigger.update,
 * lagSmoothing(0). Values: lerp .1, smoothWheel, syncTouch. Off for prefers-reduced-motion.
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
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function scrollToEl(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView();
}
