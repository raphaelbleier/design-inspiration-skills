/**
 * intro.js - letters of the wordmark pop in with rainbow colours, then a full-bleed circle
 * (same colour as the hero) grows over them and the overlay is removed.
 * Values: letter scale .8 -> 1 with elastic.out(.34,.26), stagger .08; circle scale 0 -> 1 in .9s power4.inOut.
 */
import gsap from 'gsap';
import { reduced } from './scroll.js';

const COLORS = ['#f15b40', '#ffd372', '#88c1f8', '#e72f63'];

export function runIntro() {
  const intro = document.getElementById('intro');
  return new Promise((resolve) => {
    const done = () => { intro.classList.add('off'); document.body.classList.remove('loading'); resolve(); };
    if (!intro || reduced) return done();
    const word = document.getElementById('intro-word');
    word.innerHTML = [...'KIKO'].map((c, i) => `<span style="color:${COLORS[i]}">${c}</span>`).join('');
    const circle = document.getElementById('intro-circle');
    gsap.timeline({ onComplete: done })
      .to(word.children, { scale: 1, opacity: 1, duration: 1.1, ease: 'elastic.out(0.34, 0.26)', stagger: 0.08 }, 0.2)
      .to(circle, { scale: 3.2, duration: 0.9, ease: 'power4.inOut' }, 1.5)
      .to(word, { opacity: 0, duration: 0.3 }, 1.8);
  });
}
