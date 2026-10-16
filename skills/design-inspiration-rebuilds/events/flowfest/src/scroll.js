// Technique: Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger and tweens share one frame loop.
// Values: lerp .1, lagSmoothing(0). Skipped entirely under prefers-reduced-motion.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initScroll() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));   // gsap time is seconds, lenis wants ms
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
