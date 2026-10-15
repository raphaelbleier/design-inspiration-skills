/**
 * marquee.js - infinite partner wordmark strip. Fictional partners, drawn as styled text / tiny SVGs.
 * Two copies of the row, translated -50% on a linear loop (pure GSAP tween; CSS animation would also do).
 * The strip also gets a velocity boost from scroll (Lenis velocity is overkill - ScrollTrigger's is enough).
 */
import { gsap, ScrollTrigger, reduced } from './scroll.js';

const partners = [
  `<b class="p p-axiom">AXIOM</b>`,
  `<i class="p p-north">Northwind</i>`,
  `<span class="p p-vellum"><svg viewBox="0 0 24 24"><path d="M3 5h5l4 11 4-11h5L14 21h-4Z" fill="currentColor"/></svg>VELLUM</span>`,
  `<span class="p p-kinetik">kinetik</span>`,
  `<span class="p p-orbit"><svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="5" fill="currentColor"/><ellipse cx="14" cy="14" rx="13" ry="5" fill="none" stroke="currentColor" stroke-width="2" transform="rotate(-25 14 14)"/></svg>orbitrap</span>`,
  `<span class="p p-pulsar">PULSAR<small>ELECTRIC</small></span>`,
  `<span class="p p-tempo">TEMPO</span>`,
  `<span class="p p-quadra"><svg viewBox="0 0 30 18"><path d="M2 14C8 2 22 2 28 8c-8-2-16 0-26 6Z" fill="currentColor"/></svg>QUADRA</span>`,
  `<span class="p p-meridian">Meridian</span>`,
  `<span class="p p-lumen">lumen<sup>&reg;</sup></span>`,
];

export function initMarquee() {
  document.querySelectorAll('[data-marquee]').forEach((m) => {
    const row = m.querySelector('.marquee__row');
    const html = partners.map((p) => `<span class="marquee__item">${p}</span>`).join('');
    row.innerHTML = html + html;
    if (reduced) return;
    const tween = gsap.to(row, { xPercent: -50, ease: 'none', duration: 38, repeat: -1 });
    ScrollTrigger.create({ trigger: m, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => gsap.to(tween, { timeScale: 1 + Math.abs(self.getVelocity()) / 400, duration: 0.3, overwrite: true, onComplete: () => gsap.to(tween, { timeScale: 1, duration: 0.8 }) }) });
  });
}
