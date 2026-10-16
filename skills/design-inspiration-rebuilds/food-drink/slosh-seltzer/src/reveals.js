/**
 * reveals.js - scroll-scrubbed type for every section. All scrubs use CSS-sticky stages + ScrollTrigger on the
 * tall section (start 'top ..', end 'bottom bottom'), never pin spacers, so Lenis stays in sync.
 *  - flow:    chars rise from a ghost tint (#EBB0EB, .35 opacity) to red, stagger .02; FLOWING skews -14deg and grows 1.5x.
 *  - taste:   chars go ghost cream (#ECE4D5) -> orange; fruit progress (state.fruit) is a separate scrub 'top -20%' -> 'bottom bottom'.
 *  - cups:    image rises from y 120 / rotate -6; pointer tilts it +-5deg.
 *  - cards:   y 80 + opacity, stagger .12, once.  party: three photos rotate/rise.  outro: outlined marquee + hands clip-path open.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { state, reduced } from './state.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
const split = (sel) => SplitText.create(sel, { type: 'chars', charsClass: 'ch' }).chars;
const scrub = (trigger, start, end, s = 0.6) => ({ trigger, start, end, scrub: s });

export function initReveals() {
  // bubbles exist in the DOM even with reduced motion (static)
  const bub = document.getElementById('bubbles');
  for (let i = 0; i < 70; i++) {
    const b = document.createElement('i'); b.className = 'bub';
    const s = 4 + Math.random() * 16;
    Object.assign(b.style, { width: s + 'px', height: s + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%' });
    bub.appendChild(b);
    if (!reduced) gsap.to(b, { yPercent: -(300 + Math.random() * 900), ease: 'none', scrollTrigger: scrub('#flow', 'top bottom', 'bottom top', true) });
  }
  if (reduced) { state.bands = 0.4; return; }

  /* flow */
  const A = split('#flowA'), B = split('#flowB');
  gsap.set([A, B], { opacity: 0.35, color: '#EBB0EB', yPercent: 30 });
  gsap.timeline({ scrollTrigger: scrub('#flow', 'top 70%', 'bottom bottom'), defaults: { ease: 'power2.out' } })
    .to(A, { yPercent: 0, opacity: 1, color: '#FF0837', stagger: 0.02, duration: 0.2 }, 0)
    .to(B, { yPercent: 0, opacity: 1, color: '#FF0837', stagger: 0.02, duration: 0.2 }, 0.14)
    .to('#flowA', { yPercent: -10, duration: 0.3, ease: 'none' }, 0.4)
    .to('#flowB', { skewX: -14, scale: 1.45, transformOrigin: '50% 100%', duration: 0.4, ease: 'power2.in' }, 0.5)
    .to('#flowA', { yPercent: -140, opacity: 0, duration: 0.25, ease: 'power2.in' }, 0.62);

  /* taste */
  const T = split('.taste-t .w');
  gsap.set(T, { color: '#ECE4D5', yPercent: 40, opacity: 0.6 });
  gsap.to(T, { yPercent: 0, opacity: 1, color: '#FF5F00', stagger: 0.03, ease: 'power2.out', scrollTrigger: scrub('#taste', 'top 60%', 'top -10%') });
  ScrollTrigger.create({ trigger: '#taste', start: 'top -20%', end: 'bottom bottom', scrub: 0.6, onUpdate: (s) => { state.fruit = s.progress; } });

  /* cups */
  gsap.from('.cups-k, .cups-t', { yPercent: 70, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '#cups', start: 'top 55%', once: true } });
  gsap.fromTo('.cups-img', { y: 140, rotate: -6 }, { y: 0, rotate: 0, ease: 'power2.out', scrollTrigger: scrub('#cups', 'top 70%', 'top 10%') });
  const cups = document.getElementById('cupsImg').parentElement;
  const rx = gsap.quickTo(cups, 'rotationY', { duration: 0.6 }), ry = gsap.quickTo(cups, 'rotationX', { duration: 0.6 });
  addEventListener('pointermove', (e) => { rx(state.mx * 5); ry(-state.my * 5); });
  gsap.set(cups, { transformPerspective: 900 });

  /* flavor cards */
  const FT = split('.flv-t');
  gsap.from(FT, { yPercent: 100, opacity: 0, stagger: 0.025, duration: 0.7, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.flv-t', start: 'top 85%', once: true } });
  gsap.from('.card', { y: 90, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: '.cards', start: 'top 85%', once: true } });

  /* bands: rows slide in opposite directions, can progress */
  document.querySelectorAll('#bands .run').forEach((r, i) =>
    gsap.fromTo(r, { xPercent: i % 2 ? -33 : 0 }, { xPercent: i % 2 ? 0 : -33, ease: 'none', scrollTrigger: scrub('#bands', 'top top', 'bottom bottom', true) }));
  ScrollTrigger.create({ trigger: '#bands', start: 'top top', end: 'bottom bottom', onUpdate: (s) => { state.bands = s.progress; } });

  /* party */
  const rot = [-6, 3, -3];
  document.querySelectorAll('.shot').forEach((el, i) =>
    gsap.fromTo(el, { y: 160 + i * 40, rotate: rot[i] * 2.2 }, { y: 0, rotate: rot[i], ease: 'power2.out', scrollTrigger: scrub(el, 'top 100%', 'top 45%') }));
  gsap.from('.party-t', { scale: 0.7, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#party', start: 'top 60%', once: true } });

  /* outro */
  gsap.fromTo('.sip-run', { xPercent: 4 }, { xPercent: -42, ease: 'none', scrollTrigger: scrub('#outro', 'top bottom', 'bottom bottom', true) });
  gsap.fromTo('.hands', { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', scrollTrigger: scrub('#outro', 'top 50%', 'top -10%') });
  gsap.fromTo('#handsImg', { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: scrub('#outro', 'top 50%', 'bottom bottom') });
}
