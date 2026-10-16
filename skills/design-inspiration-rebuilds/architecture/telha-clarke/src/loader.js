/**
 * loader.js - black full-screen counter 0 -> 100 %, then the panel slides up and the wordmark letters rise.
 * Values: counter 1.4s power1.inOut, panel yPercent -100 over .9s power3.inOut, letters stagger .04 power4.out.
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function runLoader() {
  const loader = document.querySelector('.loader');
  const n = loader.querySelector('.loader-n');
  const letters = document.querySelectorAll('.wordmark .ch');
  if (reduced) { loader.remove(); return; }
  gsap.set(letters, { yPercent: 110 });
  const o = { v: 0 };
  gsap.timeline({ onComplete: () => loader.remove() })
    .to(o, { v: 100, duration: 1.4, ease: 'power1.inOut', onUpdate: () => { n.textContent = Math.round(o.v); } })
    .to(loader, { yPercent: -100, duration: 0.9, ease: 'power3.inOut' })
    .to(letters, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.04 }, '-=0.5');
}
