// Technique: Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger stays in sync.
// Values: lerp .1, anchor links scroll with Lenis (duration 1.4s, expo-out).
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function initScroll(reduce) {
  if (reduce) return;
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const el = document.querySelector(a.getAttribute('href'));
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { duration: 1.4, easing: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)) });
    }));
}
