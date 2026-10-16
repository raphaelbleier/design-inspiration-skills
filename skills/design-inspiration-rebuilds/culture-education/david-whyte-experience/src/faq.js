/* Technique: accordion via CSS grid-template-rows 0fr -> 1fr (.8s cubic-bezier(.22,.61,.36,1)); one open at a time.
   Opening changes page height, so ScrollTrigger is refreshed after the transition. */
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initFaq() {
  const items = [...document.querySelectorAll('.q')];
  items.forEach((q) => q.querySelector('.q__head').addEventListener('click', () => {
    const open = !q.classList.contains('is-open');
    items.forEach((o) => { o.classList.remove('is-open'); o.querySelector('.q__head').setAttribute('aria-expanded', 'false'); o.querySelector('u').textContent = 'View'; });
    if (open) { q.classList.add('is-open'); q.querySelector('.q__head').setAttribute('aria-expanded', 'true'); q.querySelector('u').textContent = 'Close'; }
    setTimeout(() => ScrollTrigger.refresh(), 850);
  }));
}
