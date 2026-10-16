/**
 * calc.js - yard efficiency calculator. Yearly saving =
 *   gates * shifts * 2080h/3 * $28/h (labor) + trucks * 365 * 7min * $1.4/min (dwell).
 * The number tweens 0.8s power2.out, so changes read as a counter, not a jump.
 */
import { gsap } from './scroll.js';

export function initCalc() {
  const form = document.querySelector('[data-calc]');
  const out = form.querySelector('[data-out]');
  const n = (k) => Math.max(0, +form.elements[k].value || 0);
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const state = { v: 0 };
  const run = () => {
    const target = n('gates') * n('shifts') * (2080 / 3) * 28 + n('trucks') * 365 * 7 * 1.4;
    gsap.to(state, { v: target, duration: 0.8, ease: 'power2.out', onUpdate: () => (out.textContent = fmt.format(state.v)) });
  };
  form.addEventListener('input', run);
  run();
}
