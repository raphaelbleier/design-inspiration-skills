/* Side menu: panel opens with clip-path inset(0 100% 0 0) -> inset(0) over .8s power3.out; scrim fades and
   blurs the page; links rise yPercent via y 14 -> 0, stagger .04 after a .25s delay. Escape / scrim closes.
   Other fixed marks (orange tab, column lines) sit below the panel's z-index. */
import { gsap } from 'gsap';

export function initMenu(reduce) {
  const menu = document.getElementById('menu');
  const scrim = document.getElementById('scrim');
  const links = menu.querySelectorAll('.menu__body a');
  const d = reduce ? 0 : 1;
  const open = () => {
    menu.style.visibility = 'visible'; scrim.classList.add('on'); menu.setAttribute('aria-hidden', 'false');
    gsap.to(menu, { clipPath: 'inset(0 0% 0 0)', duration: 0.8 * d, ease: 'power3.out' });
    gsap.to(scrim, { opacity: 1, duration: 0.6 * d });
    gsap.to(links, { opacity: 1, y: 0, duration: 0.7 * d, ease: 'power3.out', stagger: 0.04 * d, delay: 0.25 * d });
  };
  const close = () => {
    scrim.classList.remove('on'); menu.setAttribute('aria-hidden', 'true');
    gsap.to(scrim, { opacity: 0, duration: 0.5 * d });
    gsap.to(menu, { clipPath: 'inset(0 100% 0 0)', duration: 0.6 * d, ease: 'power3.inOut', onComplete: () => { menu.style.visibility = 'hidden'; gsap.set(links, { opacity: 0, y: 14 }); } });
  };
  document.querySelectorAll('[data-menu]').forEach((b) => b.addEventListener('click', open));
  scrim.addEventListener('click', close);
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  addEventListener('keydown', (e) => e.key === 'Escape' && close());
}
