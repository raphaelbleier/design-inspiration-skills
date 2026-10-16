/**
 * gallery.js - click gallery with a directional wipe.
 * Technique: incoming slide sits on top with clip-path inset(0 0 0 100%) -> inset(0) (next) or
 * inset(0 100% 0 0) -> inset(0) (prev), 1.1s expo.inOut; its image counter-scales 1.2 -> 1.
 * Click on right half = next, left half = prev. Counter text "n / total".
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

export function initGallery() {
  const frame = document.getElementById('galFrame');
  const slides = [...frame.querySelectorAll('.gal__s')];
  const out = document.getElementById('galN');
  let cur = 0, busy = false;

  function go(dir) {
    if (busy) return;
    const next = (cur + dir + slides.length) % slides.length;
    const a = slides[cur], b = slides[next];
    out.textContent = `${next + 1} / ${slides.length}`;
    const from = dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
    const done = () => { a.classList.remove('is-on'); b.classList.remove('is-in'); b.classList.add('is-on'); b.style.clipPath = ''; cur = next; busy = false; };
    if (reduced) { b.classList.add('is-in'); b.style.clipPath = 'inset(0)'; return done(); }
    busy = true;
    b.classList.add('is-in');
    gsap.fromTo(b, { clipPath: from }, { clipPath: 'inset(0 0 0 0)', duration: 1.1, ease: 'expo.inOut', onComplete: done });
    gsap.fromTo(b.firstElementChild, { scale: 1.2 }, { scale: 1, duration: 1.4, ease: 'expo.out' });
  }
  frame.addEventListener('click', (e) => {
    const r = frame.getBoundingClientRect();
    go(e.clientX - r.left < r.width / 2 ? -1 : 1);
  });
}
