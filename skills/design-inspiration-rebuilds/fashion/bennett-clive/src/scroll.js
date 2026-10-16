/**
 * scroll.js - Lenis smooth scroll on the GSAP ticker.
 * Technique: Lenis { lerp: .1, smoothWheel }, autoRaf:false; gsap.ticker drives lenis.raf,
 * lenis 'scroll' feeds ScrollTrigger.update, lagSmoothing(0). Off under prefers-reduced-motion.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export function initScroll() {
  if (reduced) return;
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', (e) => {
    const el = document.querySelector(a.getAttribute('href'));
    if (el) { e.preventDefault(); lenis.scrollTo(el, { duration: 1.4 }); }
  }));
}
