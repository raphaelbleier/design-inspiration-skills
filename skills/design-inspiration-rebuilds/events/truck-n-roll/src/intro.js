/**
 * intro.js - page-load sequence.
 * Logo blocks drop in rotated (rotate -15deg final) with back.out(1.6); hero headline lines
 * rise from a mask (yPercent 105 -> 0) 1.1s power4.out, stagger .09; tagline + nav fade 0.6s.
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function intro() {
  if (reduced) return;
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.logo span', { yPercent: -140, rotate: 18, duration: 1.1, stagger: 0.12, ease: 'back.out(1.6)' })
    .from('.h1 .ln i', { yPercent: 105, duration: 1.1, stagger: 0.09 }, 0.25)
    .from('.top__tag, .top__lang, .nav, .hero__cap', { opacity: 0, y: 14, duration: 0.6, stagger: 0.06, ease: 'power2.out' }, 0.5)
    .from('.hero .px', { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power3.inOut' }, 0.2);
}
