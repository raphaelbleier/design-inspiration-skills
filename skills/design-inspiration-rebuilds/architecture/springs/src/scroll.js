/**
 * scroll.js - Lenis smooth scroll on the GSAP ticker (original used a locomotive-style
 * virtual scroller with data-scroll-sticky / data-parallax attributes; Lenis + ScrollTrigger
 * gives the same feel with native scroll). Values: lerp .09, wheelMultiplier 1.
 * Exposes `wheelVelocity` so the WebGL hero can speed up its drift when the user scrolls.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const state = { velocity: 0 };
export let lenis = null;

export function initScroll() {
  if (reduced) return;
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true, autoRaf: false });
  lenis.on('scroll', (e) => { state.velocity = e.velocity; ScrollTrigger.update(); });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
