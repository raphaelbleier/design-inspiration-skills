/* Preloader: two odometer digits (0-9 stacks, 100px tall in the original) roll from 00 to 99
 * over ~2.2s with power2.inOut, then the overlay slides up (1s, expo.inOut).
 * Digit stack height = one digit; yPercent = -(value/10 * 90)% of the stack. */
import gsap from 'gsap';

export function runLoader(reduced) {
  const el = document.getElementById('loader');
  const ins = [...el.querySelectorAll('.digit-in')];
  ins.forEach((d) => { d.innerHTML = Array.from({ length: 10 }, (_, i) => `<span>${i}</span>`).join(''); });
  if (reduced) { el.remove(); return Promise.resolve(); }
  const o = { v: 0 };
  return new Promise((done) => {
    gsap.timeline({ onComplete: () => { el.remove(); done(); } })
      .to(o, { v: 99, duration: 2.2, ease: 'power2.inOut', onUpdate() {
        const n = Math.round(o.v);
        // tens rolls once per 10, ones rolls continuously
        gsap.set(ins[0], { yPercent: -Math.floor(n / 10) * 10 });
        gsap.set(ins[1], { yPercent: -(n % 10) * 10 });
      } })
      .to(el, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '+=.25');
  });
}
