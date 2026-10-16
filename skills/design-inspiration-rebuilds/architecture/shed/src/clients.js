/**
 * clients.js - client list hover: siblings dim to .28 and "See project" slides in (CSS, .5-.6s expo.out);
 * a preview card fixed at the right edge wipes open with clip-path inset(0 0 100% 0) -> inset(0), .7s expo.out,
 * and closes in .6s when the pointer leaves the list. The image swaps per hovered row.
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initClients() {
  if (reduced || !matchMedia('(hover: hover)').matches) return;
  const prev = document.querySelector('.client-preview');
  const img = prev.querySelector('img');
  const list = document.querySelector('.client-list');
  const base = import.meta.env.BASE_URL;

  list.querySelectorAll('a').forEach((a) => {
    a.addEventListener('mouseenter', () => {
      img.src = `${base}img/${a.dataset.img}.webp`;
      gsap.to(prev, { clipPath: 'inset(0% 0 0% 0)', duration: 0.7, ease: 'expo.out', overwrite: 'auto' });
    });
  });
  list.addEventListener('mouseleave', () => gsap.to(prev, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.out', overwrite: 'auto' }));
}
