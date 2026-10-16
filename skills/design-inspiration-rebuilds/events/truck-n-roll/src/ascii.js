/**
 * ascii.js - "halftone" statement. Each word is transparent text filled with a 3px grid
 * (two repeating-linear-gradients clipped to the glyphs = the dotted/ASCII texture). A solid
 * copy (::after) fades in per line via --s. The sticky stage is 330svh tall; a scrubbed timeline
 * lifts the block upward (yPercent 0 -> -55) while lines resolve in sequence (stagger .12).
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function ascii() {
  const lines = document.querySelectorAll('.al');
  if (reduced) { lines.forEach((l) => l.style.setProperty('--s', 1)); return; }
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.ascii', start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
  tl.fromTo('.ascii__t', { yPercent: 40 }, { yPercent: -48, ease: 'none', duration: 1 }, 0);
  lines.forEach((l, i) => tl.to(l, { '--s': 1, duration: 0.14, ease: 'power1.inOut' }, 0.14 + i * 0.1));
}
