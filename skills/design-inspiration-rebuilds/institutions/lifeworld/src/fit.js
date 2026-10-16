/**
 * fit.js - giant words that span the container width exactly (.fit[data-fit]).
 * Technique: measure the word at 200px, set font-size = width/measured*200, then stretch
 * vertically (scaleY 1.35, origin on the baseline) so the capitals become tall and narrow.
 * The container is only as tall as the stretched cap height, clipped (overflow hidden).
 * Reveal: the word rises from below its own baseline when it enters (top 90%, 1.4s power3.out).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { metrics } from './glyph.js';
import { reduced } from './scroll.js';

const STRETCH = 1.35;

export function initFit() {
  const els = [...document.querySelectorAll('.fit')];
  const layout = () => els.forEach((el) => {
    const span = el.firstElementChild;
    const W = el.clientWidth;
    const m = metrics(el.dataset.fit, 200);
    const fs = (W / m.width) * 200;
    const k = fs / 200;
    const cap = m.cap * k, base = m.base * k;
    el.style.height = `${cap * STRETCH}px`;
    el.style.position = 'relative';
    Object.assign(span.style, { position: 'absolute', left: '0', width: '100%', fontSize: `${fs}px`, lineHeight: '1', top: `${cap * STRETCH - base}px` });
    gsap.set(span, { transformOrigin: `50% ${base}px`, scaleY: STRETCH });
  });
  layout();
  addEventListener('resize', () => { layout(); ScrollTrigger.refresh(); });
  if (reduced) return;
  els.forEach((el) => gsap.from(el.firstElementChild, {
    yPercent: 110, duration: 1.4, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
  }));
}
