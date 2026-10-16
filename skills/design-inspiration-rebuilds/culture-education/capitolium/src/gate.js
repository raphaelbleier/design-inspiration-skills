/* Technique: full-screen entry gate over a slowly drifting photo (CSS keyframes, scale 1 -> 1.1, 24s).
   "Entrer" lifts the gate off with yPercent -100, 1.4s cubic-bezier(.65,.05,0,1); the fixed mark drops in after. */
import { gsap } from 'gsap';
import { lenis } from './scroll.js';

export function initGate(onEnter) {
  const gate = document.getElementById('gate');
  const btn = document.getElementById('enter');
  gsap.from('.gate__inner > *', { y: 24, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.14, delay: 0.2 });
  gsap.from(btn, { opacity: 0, duration: 1, delay: 1.1 });
  btn.addEventListener('click', () => {
    btn.disabled = true;
    gsap.timeline({ defaults: { ease: 'cubic-bezier(.65,.05,0,1)' } })
      .to('.gate__inner', { opacity: 0, y: -40, duration: 0.7 })
      .to(gate, { yPercent: -100, duration: 1.4 }, 0.15)
      .add(() => {
        document.body.classList.remove('locked');
        lenis?.start();
        gate.hidden = true;
        onEnter();
      }, '>-0.2');
  });
}
