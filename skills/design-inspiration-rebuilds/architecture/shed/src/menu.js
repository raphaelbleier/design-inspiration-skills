/**
 * menu.js - full-screen orange panel.
 * Open: clip-path inset(0 0 100% 0) -> inset(0) in .9s cubic-bezier(.9,0,.1,1); links rise yPercent 105 -> 0,
 * stagger .06, 1.2s expo.out, starting .25s in. Header turns dark and the plus rotates 135deg. Close on Esc / link.
 */
import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';
import { scrollToEl, lenis } from './scroll.js';

gsap.registerPlugin(CustomEase);

export function initMenu() {
  const menu = document.querySelector('.menu');
  const btn = document.querySelector('.menu-btn');
  const label = btn.querySelector('.menu-label');
  const header = document.querySelector('.header');
  const links = menu.querySelectorAll('.menu-link span');
  const inout = CustomEase.create('inout', '.9,0,.1,1');
  let open = false;
  gsap.set(links, { yPercent: 105 });

  function toggle(next) {
    if (next === open) return;
    open = next;
    btn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    label.textContent = open ? 'Close' : 'Menu';
    header.classList.toggle('menu-open', open);
    if (lenis) open ? lenis.stop() : lenis.start();
    gsap.killTweensOf([menu, links]);
    if (open) {
      gsap.set(menu, { visibility: 'visible' });
      gsap.to(menu, { clipPath: 'inset(0% 0 0% 0)', duration: 0.9, ease: inout });
      gsap.to(links, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06, delay: 0.25 });
    } else {
      gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: inout, onComplete: () => gsap.set([menu], { visibility: 'hidden' }) });
      gsap.set(links, { yPercent: 105, delay: 0.8 });
    }
  }

  btn.addEventListener('click', () => toggle(!open));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });
  menu.querySelectorAll('.menu-link').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    menu.querySelectorAll('.menu-link').forEach((l) => l.classList.toggle('on', l === a));
    toggle(false);
    setTimeout(() => scrollToEl(a.getAttribute('href')), 450);
  }));
  document.querySelectorAll('.footer a[href^="#"], .logo').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); scrollToEl(a.getAttribute('href'));
  }));
}
