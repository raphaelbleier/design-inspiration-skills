/* Small UI pieces: char-mask text reveal, char-roll buttons, menu, range chips, mood grid, join form. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { FLAVORS } from './flavors.js';
import { goTo, onIndex, carousel } from './carousel.js';
import { lenis } from './scroll.js';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* [data-anim]: chars rise out of a mask when the element hits 80% of the viewport; replays when scrolled back. */
export function initReveals() {
  document.querySelectorAll('[data-anim]').forEach((el) => {
    if (REDUCED) return;
    const sp = SplitText.create(el, { type: 'words,chars', mask: 'chars' });
    gsap.set(sp.chars, { yPercent: 110 });
    ScrollTrigger.create({ trigger: el, start: 'top 80%', end: 'bottom 10%',
      onToggle: (s) => gsap.to(sp.chars, { yPercent: s.isActive ? 0 : 110, duration: s.isActive ? 0.8 : 0.4, ease: 'power3.out', stagger: s.isActive ? 0.015 : 0, overwrite: true }) });
  });
  const cards = document.querySelectorAll('.mood');
  if (!REDUCED) cards.forEach((c) => gsap.from(c, { clipPath: 'inset(100% 0 0 0)', duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: c, start: 'top 90%' } }));
}

/* every .btn-roll[data-roll]: letters wrapped in .ch, the duplicate comes from data-c */
export function initRoll() {
  document.querySelectorAll('[data-roll]').forEach((el) => {
    const t = el.textContent;
    el.setAttribute('aria-label', t);
    el.innerHTML = [...t].map((c, i) => `<span class="ch" aria-hidden="true" style="--i:${i}" data-c="${c === ' ' ? ' ' : c}">${c === ' ' ? ' ' : c}</span>`).join('');
  });
}

export function initMenu() {
  const btn = document.getElementById('menu-btn'), menu = document.getElementById('menu');
  const links = menu.querySelectorAll('a');
  const origin = () => { const b = btn.getBoundingClientRect(); return `${b.left + b.width / 2}px ${b.top + b.height / 2}px`; };
  let open = false;
  const set = (v) => {
    open = v; btn.setAttribute('aria-expanded', v);
    if (v) { menu.hidden = false; menu.style.visibility = 'visible'; lenis?.stop(); }
    else lenis?.start();
    gsap.to(menu, { clipPath: v ? `circle(150% at ${origin()})` : `circle(0% at ${origin()})`, duration: 0.8, ease: 'power3.out',
      onComplete: () => { if (!v) menu.style.visibility = 'hidden'; } });
    if (v) gsap.fromTo(links, { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 0.9, ease: 'back.out(1.2)', stagger: 0.07, delay: 0.25 });
  };
  btn.addEventListener('click', () => set(!open));
  links.forEach((a) => a.addEventListener('click', () => { set(false); }));
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (lenis) lenis.scrollTo(target, { duration: 1.4 }); else target.scrollIntoView({ behavior: 'smooth' });
  });
}

export function initLists() {
  const chips = document.getElementById('range-list');
  chips.innerHTML = FLAVORS.map((f, i) => `<li><button data-i="${i}">${f.name}</button></li>`).join('');
  const mark = () => chips.querySelectorAll('button').forEach((b, i) => b.classList.toggle('is-on', i === carousel.index));
  chips.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) goTo(+b.dataset.i); });
  onIndex(mark); mark();
  document.getElementById('moods').innerHTML = FLAVORS.map((f) =>
    `<li class="mood" style="--c:${f.p}"><img src="./img/mood-${f.key}.webp" alt="" loading="lazy" onerror="this.remove()"><span>${f.name}</span></li>`).join('');
}

export function initForm() {
  document.getElementById('join-form').addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('join-msg').textContent = 'Thanks, you are on the list (demo only, nothing was sent).';
    e.target.reset();
  });
}
