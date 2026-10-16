// Smooth scroll. Technique: Lenis driven by the GSAP ticker so ScrollTrigger stays in sync.
// Values: lerp .07, wheelMultiplier .7, desktop only (> 991px), started after the loader (3.5s).
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export let lenis = null;
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function startScroll() {
  document.body.classList.remove('no-scroll');
  if (reduced || innerWidth <= 991 || lenis) return;
  lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 0.7, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
