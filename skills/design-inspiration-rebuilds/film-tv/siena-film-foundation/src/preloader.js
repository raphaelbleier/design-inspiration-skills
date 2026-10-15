/*
 * PRELOADER
 * ---------
 * Shown on a first visit only: the "seen" flag is a cookie with a 1 hour TTL. Logo letters rise in, and the ENTER
 * ticket button appears after 3.5 s (the original plays a short video behind it; this study has no video asset,
 * so the stage stays black with grain). Resolves when the visitor enters.
 */
import gsap from 'gsap';
import { btnTicket, spread } from './parts.js';

const COOKIE = 'oriel_pre';
const seen = () => document.cookie.split('; ').some((c) => c.startsWith(COOKIE + '='));

export function preloader(reduced) {
  return new Promise((resolve) => {
    if (seen()) return resolve();
    const el = document.getElementById('pre');
    el.hidden = false;
    el.innerHTML = `<div class="pre-logo"><span class="logo-main">ORIEL</span><span class="logo-sub" aria-hidden="true">${spread('FILM FOUNDATION')}</span></div><div class="pre-btn">${btnTicket('ENTER', '#/')}</div>`;
    const btn = el.querySelector('.pre-btn');
    gsap.set(btn, { autoAlpha: 0, y: 16 });
    gsap.from(el.querySelector('.logo-main'), { yPercent: 40, autoAlpha: 0, duration: 1.6, ease: 'expo.out', delay: 0.2 });
    gsap.from(el.querySelectorAll('.logo-sub i'), { autoAlpha: 0, y: 8, duration: 1.4, stagger: 0.04, ease: 'expo.out', delay: 0.6 });
    gsap.to(btn, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: reduced ? 0 : 3.5 });
    btn.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      document.cookie = `${COOKIE}=1; max-age=3600; path=/; SameSite=Lax`;
      resolve();
      gsap.to(el, { autoAlpha: 0, duration: 0.8, ease: 'power1.out', onComplete: () => { el.hidden = true; el.innerHTML = ''; } });
    });
  });
}
