/**
 * scroll.js - Lenis smooth scroll driven by the GSAP ticker.
 * Values: lerp .1, smoothWheel, syncTouch false (native touch stays native, keeps pins stable),
 * autoRaf false (gsap ticker calls raf), lagSmoothing(0). Off under prefers-reduced-motion.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export let lenis = null;

export function initScroll() {
  if (reduced) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/** Smooth jump to a section id; falls back to native scroll. */
export function goTo(id) {
  const el = id === 'top' ? document.body : document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(id === 'top' ? 0 : el, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4), offset: -10 });
  else el.scrollIntoView({ behavior: 'auto' });
}
