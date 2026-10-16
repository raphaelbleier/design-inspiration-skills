// Technique: line masks. Big text fades/slides up per block; stats count up when they enter.
// Values: .big/.body y 40 -> 0 + opacity, 1s power3.out, start 'top 88%'; counters 1.6s power2.out.
import gsap from 'gsap';
import { reduced } from './scroll.js';
export function initReveals() {
  if (reduced) return;
  gsap.utils.toArray('.reveal').forEach((el) =>
    gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
  gsap.from('.hero h1', { yPercent: 40, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 });
  gsap.from('.card', { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.cards', start: 'top 85%', once: true } });
  document.querySelectorAll('.stat b').forEach((b) => {
    const to = parseFloat(b.dataset.count), dec = +(b.dataset.dec || 0), suf = b.dataset.suffix || (b.dataset.short || '');
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: b, start: 'top 90%', once: true },
      onUpdate: () => {
        const v = suf === 'M' && to > 1000 ? o.v / 1e6 : o.v;
        b.textContent = v.toFixed(dec).replace('.', ',') + suf;
      } });
  });
}
