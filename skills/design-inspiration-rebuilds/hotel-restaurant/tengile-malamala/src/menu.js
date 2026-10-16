/**
 * menu.js - side panel menu.
 * Technique: panel clip-path inset(0 0 0 100%) -> inset(0) 1s expo.out; backdrop opacity 0 -> 1 .6s;
 * links rise from their li masks (yPercent 110 -> 0, .9s expo.out, stagger .05, delay .25).
 * Fixed header mark stays above and turns paper-coloured while open. Esc / backdrop / Close dismiss.
 * Lenis is stopped while open.
 */
import gsap from 'gsap';
import { lenis } from './scroll.js';

export function initMenu() {
  const menu = document.getElementById('menu');
  const panel = document.getElementById('menuPanel');
  const back = document.getElementById('menuBackdrop');
  const btn = document.getElementById('menuOpen');
  const hdr = document.getElementById('hdr');
  const links = menu.querySelectorAll('li a');
  let open = false;

  const set = (v) => {
    open = v;
    btn.setAttribute('aria-expanded', v);
    menu.setAttribute('aria-hidden', !v);
    hdr.classList.toggle('menu-on', false);
    if (v) { menu.classList.add('is-open'); lenis?.stop(); document.getElementById('menuClose').focus(); }
    else { lenis?.start(); btn.focus({ preventScroll: true }); }
    gsap.killTweensOf([panel, back, links]);
    if (v) {
      gsap.to(back, { opacity: 1, duration: 0.6, ease: 'power2.out' });
      gsap.to(panel, { clipPath: 'inset(0 0 0 0%)', duration: 1, ease: 'expo.out' });
      gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05, delay: 0.25 });
    } else {
      gsap.to(back, { opacity: 0, duration: 0.5, ease: 'power2.out' });
      gsap.to(panel, { clipPath: 'inset(0 0 0 100%)', duration: 0.7, ease: 'expo.inOut', onComplete: () => menu.classList.remove('is-open') });
    }
  };
  btn.addEventListener('click', () => set(true));
  document.getElementById('menuClose').addEventListener('click', () => set(false));
  back.addEventListener('click', () => set(false));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) set(false); });
  return () => open && set(false);
}
