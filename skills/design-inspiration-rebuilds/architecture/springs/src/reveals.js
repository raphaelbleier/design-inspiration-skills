/**
 * reveals.js - word-split headline reveal, fade-up, counters, tab switcher for wellness.
 * Headline: SplitText words in an overflow-hidden mask, yPercent 110 -> 0, 1.3s expo-like
 * `power4.out`, stagger .06, fires at top 85%. Fade: y 24 -> 0 + opacity, .9s `power3.out`.
 * Counters: 0 -> n over 1.6s `power2.out`, snapped to integers.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { reduced } from './scroll.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initReveals() {
  if (reduced) return;
  document.querySelectorAll('[data-split]').forEach((el) => {
    if (el.closest('.hero')) return;          // hero title is revealed after the loader
    const split = SplitText.create(el, { type: 'words', wordsClass: 'w' });
    split.words.forEach((w) => { const i = document.createElement('i'); i.innerHTML = w.innerHTML; w.innerHTML = ''; w.append(i); w.classList.add('word'); });
    gsap.set(el.querySelectorAll('.word > i'), { yPercent: 110 });
    gsap.to(el.querySelectorAll('.word > i'), { yPercent: 0, duration: 1.3, ease: 'power4.out', stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  gsap.utils.toArray('[data-fade]').forEach((el) => {
    gsap.from(el, { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  document.querySelectorAll('[data-count]').forEach((el) => {
    const o = { v: 0 };
    gsap.to(o, { v: +el.dataset.count, duration: 1.6, ease: 'power2.out', snap: { v: 1 },
      onUpdate: () => { el.textContent = o.v; },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
}

export function heroTitleIn() {
  const el = document.querySelector('.hero__title');
  if (reduced) return;
  const split = SplitText.create(el, { type: 'words', wordsClass: 'w' });
  split.words.forEach((w) => { const i = document.createElement('i'); i.innerHTML = w.innerHTML; w.innerHTML = ''; w.append(i); w.classList.add('word'); });
  const inner = el.querySelectorAll('.word > i');
  gsap.set(inner, { yPercent: 110 });
  gsap.to(inner, { yPercent: 0, duration: 1.6, ease: 'power4.out', stagger: 0.12 });
  gsap.from('.hero__sub', { opacity: 0, y: 16, duration: 1.2, delay: 0.5, ease: 'power3.out' });
}
