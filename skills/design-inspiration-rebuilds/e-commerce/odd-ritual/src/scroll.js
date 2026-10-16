/* Technique: Lenis smooth scroll driven by the GSAP ticker (one frame loop for scroll + ScrollTrigger).
   Values: Lenis 1.2.x defaults (duration 1.2, expo-out easing), lagSmoothing(0). Disabled for reduced motion. */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export let lenis = null;
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initScroll() {
  if (reduced) return;
  lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const el = document.querySelector(a.getAttribute('href'));
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: 0 });
    }));
}
