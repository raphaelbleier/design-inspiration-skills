/**
 * hero.js - flavor carousel in the hero. Background colour tweens .6s power2.inOut, the illustration
 * crossfades with a scale 1.06 -> 1 settle, the pill button recolours + relabels, the can spins (can.js).
 * Header logo is white while the hero is on screen.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FLAVORS, switchFlavor } from './can.js';

export function initHero() {
  const hero = document.getElementById('hero');
  const arts = [...document.querySelectorAll('.art')];
  const btn = document.getElementById('hero-btn');
  const label = document.getElementById('hero-btn-label');
  let i = 0;
  const go = (dir) => {
    const n = (i + dir + FLAVORS.length) % FLAVORS.length;
    const f = FLAVORS[n];
    switchFlavor(n, () => { label.textContent = f.name; btn.className = `btn-shadow ${f.btn} hero-btn`; });
    gsap.to(hero, { backgroundColor: f.bg, duration: 0.6, ease: 'power2.inOut' });
    gsap.to(arts[i], { opacity: 0, duration: 0.5 });
    gsap.fromTo(arts[n], { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' });
    i = n;
  };
  document.getElementById('prev').addEventListener('click', () => go(-1));
  document.getElementById('next').addEventListener('click', () => go(1));
  ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom 90px',
    onToggle: (s) => document.body.classList.toggle('on-hero', s.isActive),
    onRefresh: (s) => document.body.classList.toggle('on-hero', s.isActive) });
}
