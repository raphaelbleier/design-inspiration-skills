/**
 * cloud.js - pinned image cloud ("Preserving Life's Balance").
 * Technique: ScrollTrigger pin for 250% of viewport height; scrub progress p drives five images.
 * p 0 -> .45: radius 0 -> 1 on an ellipse (rx 38vw, ry 34vh), scale .2 -> 1, opacity 0 -> 1.
 * p .45 -> 1: the ring keeps expanding slowly and orbits +70deg while each image counter-rotates slightly.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

export function initCloud() {
  const imgs = [...document.querySelectorAll('.cloud__i')];
  const base = imgs.map((_, i) => (i / imgs.length) * Math.PI * 2 - Math.PI / 2 + 0.35);
  const ease = gsap.parseEase('expo.out');

  function place(p) {
    const k = ease(Math.min(p / 0.45, 1));
    const orbit = Math.max(0, (p - 0.45) / 0.55) * (70 * Math.PI) / 180;
    const rx = innerWidth * 0.38 * (1 + 0.12 * Math.max(0, p - 0.45)), ry = innerHeight * (innerWidth < 768 ? 0.42 : 0.34);
    imgs.forEach((el, i) => {
      const a = base[i] + orbit;
      gsap.set(el, { xPercent: -50, yPercent: -50, x: Math.cos(a) * rx * k, y: Math.sin(a) * ry * k,
        scale: 0.2 + 0.8 * k, opacity: Math.min(1, k * 2), rotate: (i % 2 ? 1 : -1) * 4 * (1 - k) });
    });
  }
  place(reduced ? 1 : 0);
  if (reduced) return;
  ScrollTrigger.create({ trigger: '.cloud', start: 'top top', end: '+=250%', pin: true, scrub: true,
    onUpdate: (s) => place(s.progress), onRefresh: (s) => place(s.progress) });
}
