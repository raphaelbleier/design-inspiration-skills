/* ABOUT OVERLAY
   Dark relief scene revealed by the ink mask growing out of the top-right corner (ink.js).
     open   mask --s 0 -> full   2.5 s  ease inkMask
            background "camera dive": scale 1.18 -> 1   4 s  power2.out
            nav items rise (yPercent 110 -> 0), stagger .09, 1.2 s power3.out, delay .9
     close  mask --s full -> 0   1 s  linear (ease none)
   A brighter copy of the artwork, masked by a radial gradient that follows the pointer, makes
   the cursor behave like a torch over the rock (original: bloom + cursor light in WebGL).
   While open: body.about-open (menu label "Close", UI turns light), Lenis stopped, Esc closes,
   relief rendering paused, fixed decorative marks hidden via CSS. */
import { gsap } from 'gsap';
import { state } from './state.js';
import { maskTo, fullSize } from './ink.js';
import { stop, start, scrollTo } from './scroll.js';

let open = false;
export const isOpen = () => open;

export function initAbout() {
  const el = document.getElementById('about'), btn = document.getElementById('menu');
  const label = btn.querySelector('.ui__menu-label'), bg = el.querySelector('.about__bg');
  el.setAttribute('data-light', '');
  const links = [...el.querySelectorAll('.about__nav a')];
  links.forEach((a) => { const s = document.createElement('span'); s.innerHTML = a.innerHTML; a.innerHTML = ''; a.append(s); });
  const targets = { '#about-studio': () => 0, '#about-approach': () => document.querySelector('.tblock')?.offsetTop ?? 0, '#about-services': () => document.querySelectorAll('.tblock')[1]?.offsetTop ?? 0, '#about-awards': () => document.querySelector('.pblock')?.offsetTop ?? 0, '#about-clients': () => document.querySelector('.footer')?.offsetTop ?? 0 };

  function set(on) {
    if (on === open) return; open = on;
    btn.setAttribute('aria-expanded', on); el.setAttribute('aria-hidden', !on);
    document.body.classList.toggle('about-open', on);
    label.textContent = on ? 'Close' : 'Menu';
    const spans = el.querySelectorAll('.about__nav a span');
    if (on) {
      stop(); el.classList.add('is-open');
      maskTo(el, fullSize(), 2.5, 'inkMask');
      if (!state.reduced) {
        gsap.fromTo(bg, { scale: 1.18 }, { scale: 1, duration: 4, ease: 'power2.out' });
        gsap.fromTo(spans, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.09, delay: 0.9, ease: 'power3.out' });
      }
    } else {
      maskTo(el, 0, 1, 'none').then?.(() => {});
      gsap.delayedCall(state.reduced ? 0 : 1.02, () => { if (!open) { el.classList.remove('is-open'); start(); } });
    }
  }
  btn.addEventListener('click', () => set(!open));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  links.forEach((a) => a.addEventListener('click', (e) => {
    const t = targets[a.getAttribute('href')]; if (!t) return;
    e.preventDefault(); set(false);
    if (location.hash && location.hash !== '#/' ) location.hash = '#/';
    gsap.delayedCall(1.1, () => scrollTo(t(), { immediate: state.reduced }));
  }));
  addEventListener('hashchange', () => set(false));
  return { close: () => set(false) };
}
