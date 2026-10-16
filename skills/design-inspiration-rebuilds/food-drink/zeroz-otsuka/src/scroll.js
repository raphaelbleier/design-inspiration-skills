/* Smooth scroll on the GSAP ticker.
   Technique: Lenis `{ lerp: .1, smoothWheel, syncTouch: false }` with autoRaf off; one frame loop
   (gsap.ticker) drives Lenis, ScrollTrigger and the WebGL render so pinned/sticky copy and the 3D
   scene never drift apart. Disabled entirely under prefers-reduced-motion. */
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export let lenis = null;
const frameCallbacks = [];
export const onFrame = (fn) => frameCallbacks.push(fn);

export function initScroll() {
  if (reduced) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);                       // gsap time is seconds, Lenis wants ms
    frameCallbacks.forEach((fn) => fn(time));
  });
}

export function scrollToEl(el, immediate = false) {
  const y = el.getBoundingClientRect().top + scrollY;
  lenis ? lenis.scrollTo(y, { immediate }) : scrollTo({ top: y });
}
