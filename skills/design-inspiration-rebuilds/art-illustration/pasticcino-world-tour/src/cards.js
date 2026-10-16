/* Technique: hotspots open a tilted paper card over an olive pattern overlay.
   Overlay fades in 0.5s; the card drops in from y:60 with back.out(1.2) 0.9s. */
import { gsap } from 'gsap';
import { lock } from './scroll.js';

const TEXT = {
  fabric: ['Folded for the road', 'Every season the atelier folds a few metres of striped wool for pouches that will never see a shop window.'],
  painting: ['A hill you can almost walk', 'The cypress road in the frame is the same one the pouch will take on its way south.'],
  harbour: ['Salt and thread', 'Nets dry on the quay; the clasp is polished the way the old boats are, with a rag and patience.'],
  market: ['Lemons, leather, small change', 'Market stalls are where a coin pouch earns its name. Bring exact change.'],
};

export function initCards() {
  const overlay = document.getElementById('card');
  const form = document.getElementById('form');
  const open = (el) => {
    lock(true); el.hidden = false; document.body.classList.add('card-open');
    gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 });
    gsap.fromTo(el.querySelector('.paper-card'), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'back.out(1.2)' });
  };
  const close = (el) => gsap.to(el, { autoAlpha: 0, duration: 0.4, onComplete: () => {
    el.hidden = true; lock(false); document.body.classList.remove('card-open'); } });

  document.querySelectorAll('.spot').forEach((b) => b.addEventListener('click', () => {
    const [t, p] = TEXT[b.dataset.card];
    overlay.querySelector('.card-title').textContent = t;
    overlay.querySelector('.card-text').textContent = p;
    open(overlay);
  }));
  document.querySelector('.join').addEventListener('click', () => open(form));
  [overlay, form].forEach((el) => el.querySelectorAll('.close').forEach((c) => c.addEventListener('click', () => close(el))));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') [overlay, form].forEach((el) => !el.hidden && close(el)); });
}
