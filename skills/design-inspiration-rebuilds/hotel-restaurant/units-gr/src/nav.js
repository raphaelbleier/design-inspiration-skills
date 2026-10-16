/**
 * nav.js - rail links jump with Lenis; below 900px the burger opens the tile menu
 * (clip-path inset 0 0 100% 0 -> inset(0), .8s expo.out in CSS).
 */
import { goTo, lenis } from './scroll.js';

export function initNav() {
  const rail = document.getElementById('rail');
  const burger = document.getElementById('burger');
  const set = (open) => {
    rail.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    open ? lenis?.stop() : lenis?.start();
  };
  burger.onclick = () => set(!rail.classList.contains('open'));
  document.querySelectorAll('[data-nav]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); set(false); goTo(a.dataset.nav);
  }));
}
