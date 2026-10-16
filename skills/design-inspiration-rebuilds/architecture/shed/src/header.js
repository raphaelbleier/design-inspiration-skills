/**
 * header.js - fixed header: scrolling text marquee + colour tone per section.
 * Marquee: one sentence repeated, translated by -50% in a linear 40s loop (two identical halves).
 * Tone: every section carries data-tone="light|dark"; the section under y=25px (scroll listener) sets the header takes its colour
 * (colour transition .5s cubic-bezier(.14,1,.34,1)).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

const TEXT = 'Building brands through experience for more than 25 years';

export function initHeader() {
  const track = document.querySelector('.marquee-track');
  const unit = Array.from({ length: 4 }, () => `<span>${TEXT}</span>`).join('');
  track.innerHTML = unit + unit;
  if (!reduced) gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });

  const header = document.querySelector('.header');
  const secs = [...document.querySelectorAll('section[data-tone], footer[data-tone]')];
  const tone = () => {
    const sec = secs.find((e) => { const r = e.getBoundingClientRect(); return r.top <= 25 && r.bottom > 25; });
    if (sec) header.dataset.tone = sec.dataset.tone;
  };
  ScrollTrigger.addEventListener('refresh', tone);
  addEventListener('scroll', tone, { passive: true });
  tone();
}
