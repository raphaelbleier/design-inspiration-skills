// Smooth scroll: Lenis { lerp: .1 } driven by the GSAP ticker (one frame loop for scroll + ScrollTrigger).
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export let lenis = null;
export function initScroll(reduced) {
  gsap.registerPlugin(ScrollTrigger);
  if (reduced) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));   // gsap seconds -> lenis ms
  gsap.ticker.lagSmoothing(0);
}
