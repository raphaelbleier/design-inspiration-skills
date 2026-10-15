/**
 * menu.js - full-screen menu.
 * Open : clip-path ellipse grows from the menu button, .8s power3.out; links rise with back.out(1.2).
 * Close: same ellipse in reverse, slightly faster. Scroll is locked while open.
 */
import { gsap, lockScroll } from './scroll.js';

export function initMenu() {
  const menu = document.querySelector('[data-menu]');
  const btn = document.querySelector('[data-menu-toggle]');
  if (!menu || !btn) return;
  const links = menu.querySelectorAll('.menu__link span');
  const imgs = menu.querySelectorAll('.menu__img');
  const extras = menu.querySelectorAll('.menu__badge, .menu__foot');
  let open = false;

  // ellipse origin = centre of the menu button, in % of the viewport
  const origin = () => {
    const r = btn.getBoundingClientRect();
    return `${((r.left + r.width / 2) / innerWidth) * 100}% ${((r.top + r.height / 2) / innerHeight) * 100}%`;
  };
  const hidden = () => `ellipse(0% 0% at ${origin()})`;
  const shown = () => `ellipse(150% 150% at ${origin()})`;
  gsap.set(menu, { clipPath: hidden(), visibility: 'hidden' });

  function toggle(force) {
    open = typeof force === 'boolean' ? force : !open;
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.documentElement.classList.toggle('menu-open', open);
    lockScroll(open);
    gsap.killTweensOf([menu, links, imgs, extras]);
    if (open) {
      gsap.set(menu, { visibility: 'visible', clipPath: hidden() });
      gsap.to(menu, { clipPath: shown(), duration: 0.8, ease: 'power3.out' });
      gsap.fromTo(links, { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 0.9, ease: 'back.out(1.2)', stagger: 0.07, delay: 0.25 });
      gsap.fromTo(imgs, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.3 });
      gsap.fromTo(extras, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.6 });
    } else {
      gsap.to(menu, { clipPath: hidden(), duration: 0.6, ease: 'power3.inOut', onComplete: () => gsap.set(menu, { visibility: 'hidden' }) });
    }
  }
  btn.addEventListener('click', () => toggle());
  window.addEventListener('keydown', (e) => e.key === 'Escape' && open && toggle(false));
  menu.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) toggle(false); });
  return { toggle };
}
