/* Smooth scroll: Lenis driven by the GSAP ticker (one frame loop for scroll, ScrollTrigger and WebGL).
   Values: lerp .1, lagSmoothing(0). Also drives the right-edge progress thumb and nav highlight. */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const frameCallbacks = new Set();
export let lenis = null;

export function initScroll() {
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);
  }
  gsap.ticker.add((t) => {
    if (lenis) lenis.raf(t * 1000);
    frameCallbacks.forEach((fn) => fn(t));
  });

  // progress thumb on the right edge
  const thumb = document.querySelector('.bar i');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      thumb.style.transform = `translateY(${self.progress * (innerHeight - thumb.offsetHeight)}px)`;
    },
  });

  // nav: highlight the section in view; anchors go through lenis
  const links = [...document.querySelectorAll('.nav nav a')];
  const mark = (id) => links.forEach((a) => a.classList.toggle('on', a.hash === '#' + id));
  ['intro', 'features', 'product', 'contact'].forEach((id) => {
    ScrollTrigger.create({ trigger: '#' + id, start: 'top 55%', end: 'bottom 55%',
      onToggle: (s) => s.isActive && mark(id) });
  });
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const el = document.querySelector(a.hash);
      if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
      else el.scrollIntoView();
    }));
}
