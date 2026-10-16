/**
 * scroll.js - Lenis smooth scroll driven by the GSAP ticker.
 * Technique: autoRaf:false, gsap.ticker -> lenis.raf(time*1000), lenis 'scroll' -> ScrollTrigger.update,
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
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    lenis.scrollTo(t, { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
  }));
}
