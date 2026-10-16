/* Technique: fixed 3-cell mark with burger; full-screen menu opens as a circle clip-path from the top centre.
   Values: circle(0 -> 150%) at 50% 50px, .9s power3.out; links yPercent 110 -> 0, stagger .07.
   Chapter pill at the bottom swaps its label per chapter (ScrollTrigger onToggle). */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lenis } from './scroll.js';

export function showChrome() {
  document.getElementById('mark').classList.add('on');
}

export function initMenu() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const links = menu.querySelectorAll('li a');
  let open = false;
  const set = (v) => {
    open = v;
    burger.setAttribute('aria-expanded', v);
    document.body.classList.toggle('menu-open', v);
    if (v) { lenis?.stop(); menu.style.visibility = 'visible'; }
    else lenis?.start();
    gsap.to(menu, { clipPath: v ? 'circle(150% at 50% 50px)' : 'circle(0% at 50% 50px)', duration: v ? 0.9 : 0.7, ease: v ? 'power3.out' : 'power3.inOut',
      onComplete: () => { if (!v) menu.style.visibility = 'hidden'; } });
    if (v) gsap.fromTo(links, { yPercent: 110, rotate: 3 }, { yPercent: 0, rotate: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, delay: 0.25 });
  };
  burger.addEventListener('click', () => set(!open));
  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    set(false);
    const t = document.querySelector(a.getAttribute('href'));
    if (t) lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView();
  }));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) set(false); });
}

export function initPill() {
  const pill = document.getElementById('pill');
  const label = pill.querySelector('span');
  document.querySelectorAll('.chap').forEach((ch) => {
    ScrollTrigger.create({
      trigger: ch, start: 'top 60%', end: 'bottom 40%',
      onToggle: (self) => {
        if (self.isActive) { label.textContent = ch.dataset.chap; pill.classList.add('on'); }
        else if (!document.querySelector('.chap.is-on:not(#' + ch.id + ')')) pill.classList.remove('on');
        ch.classList.toggle('is-on', self.isActive);
        document.getElementById('mark').classList.toggle('mini', !!document.querySelector('.chap.is-on'));
      },
    });
  });
}
