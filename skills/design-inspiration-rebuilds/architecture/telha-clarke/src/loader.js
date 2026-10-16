/**
 * loader.js - black full-screen counter 0 -> 100 %, then the panel slides up and the hero photo settles from scale 1.15.
 * Values: counter 1.4s power1.inOut, panel yPercent -100 over .9s power3.inOut, photo scale 1.15 -> 1 over 1.6s power3.out.
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function runLoader() {
  const loader = document.querySelector('.loader');
  const n = loader.querySelector('.loader-n');
  const img = document.querySelector('.hero-img');
  if (reduced) { loader.remove(); return; }
  gsap.set(img, { scale: 1.15 });
  const o = { v: 0 };
  gsap.timeline({ onComplete: () => loader.remove() })
    .to(o, { v: 100, duration: 1.4, ease: 'power1.inOut', onUpdate: () => { n.textContent = Math.round(o.v); } })
    .to(loader, { yPercent: -100, duration: 0.9, ease: 'power3.inOut' })
    .to(img, { scale: 1, duration: 1.6, ease: 'power3.out' }, '-=0.7');
}
