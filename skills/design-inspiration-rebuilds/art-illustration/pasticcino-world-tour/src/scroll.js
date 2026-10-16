/* Technique: Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger pins and
   custom frame callbacks share one clock. Values: lerp .1, lagSmoothing(0). */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export let lenis = null;

export function startScroll() {
  if (reduced || lenis) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((t) => lenis.raf(t * 1000));   // gsap seconds -> lenis ms
}
export const lock = (on) => (on ? lenis?.stop() : lenis?.start());
