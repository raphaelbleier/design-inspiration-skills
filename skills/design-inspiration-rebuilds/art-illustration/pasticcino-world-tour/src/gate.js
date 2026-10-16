/* Technique: entry gate. "Start now" fades the CTA, reveals the olive intro card with a
   clip-path wipe (1.1s power3.out), holds 2.2s, then the whole gate wipes upward
   (clip-path inset, 1.2s power3.inOut) revealing the pinned journey underneath. */
import { gsap } from 'gsap';
import { startScroll, reduced } from './scroll.js';

export function initGate(onDone) {
  const gate = document.getElementById('gate');
  const start = gate.querySelector('.start');
  const hint = gate.querySelector('.hint');
  const card = gate.querySelector('.intro-card');
  const dur = (d) => (reduced ? 0.01 : d);

  start.addEventListener('click', () => {
    card.hidden = false;
    gsap.timeline()
      .to([start, hint], { autoAlpha: 0, y: 20, duration: dur(0.5), ease: 'power2.out' })
      .fromTo(card, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: dur(1.1), ease: 'power3.out' }, 0.2)
      .add(() => { onDone(); startScroll(); }, '+=' + (reduced ? 0.4 : 2.2))
      .to(gate, { clipPath: 'inset(0 0 100% 0)', duration: dur(1.2), ease: 'power3.inOut' })
      .set(gate, { display: 'none' });
  }, { once: true });
}
