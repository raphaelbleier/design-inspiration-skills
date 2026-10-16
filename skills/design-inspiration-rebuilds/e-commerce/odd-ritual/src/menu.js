/* Technique: full-screen white panel opens with clip-path inset(0 0 100% 0) -> inset(0) (.9s power3.inOut);
   links rise out of their masks (yPercent 110 -> 0, .8s power3.out, stagger .07). Cart drawer slides from
   the right (.7s power3.inOut). Burger lines converge into an X. Esc closes. */
import gsap from 'gsap';
import { lenis } from './scroll.js';

export function initMenu() {
  const menu = document.getElementById('menu'), burger = document.getElementById('burger');
  const links = menu.querySelectorAll('.menu-link span');
  const cart = document.getElementById('cart');
  let open = false;

  function toggleMenu(v = !open) {
    open = v;
    burger.setAttribute('aria-expanded', v);
    menu.setAttribute('aria-hidden', !v);
    v ? lenis?.stop() : lenis?.start();
    if (v) gsap.set(menu, { visibility: 'visible' });
    gsap.to(menu, { clipPath: v ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)', duration: 0.9, ease: 'power3.inOut',
      onComplete() { if (!v) gsap.set(menu, { visibility: 'hidden' }); } });
    if (v) gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07, delay: 0.3 });
    const [a, b] = burger.children;
    gsap.to(a, { y: v ? 1.5 : 0, rotate: v ? 8 : 0, duration: 0.5, ease: 'power3.out' });
    gsap.to(b, { y: v ? -1.5 : 0, rotate: v ? -8 : 0, duration: 0.5, ease: 'power3.out' });
  }
  burger.addEventListener('click', () => toggleMenu());
  links.forEach((l) => l.parentElement.addEventListener('click', () => toggleMenu(false)));

  const toggleCart = (v) => {
    cart.setAttribute('aria-hidden', !v);
    if (v) gsap.set(cart, { visibility: 'visible' });
    gsap.to(cart, { xPercent: v ? -100 : 0, duration: 0.7, ease: 'power3.inOut', onComplete() { if (!v) gsap.set(cart, { visibility: 'hidden' }); } });
  };
  document.getElementById('cartBtn').addEventListener('click', () => toggleCart(true));
  document.getElementById('cartClose').addEventListener('click', () => toggleCart(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (open) toggleMenu(false); toggleCart(false); } });
}
