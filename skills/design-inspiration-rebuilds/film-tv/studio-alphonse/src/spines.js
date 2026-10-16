// Spine strip. Technique: a row of VHS-spine cards built from data (year, wordmark, vertical title)
// and moved as an infinite marquee (xPercent 0 -> -50, 40s linear). Each spine is 6.4vw wide, 20vw tall.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

const rows = [
  ['2024', 'Mar', 'Les voiles de mars', '#7a5b4a'], ['2023', 'Alba', 'Alba sur mer', '#4d6b78'], ['2022', 'Noor', 'Quartier haut', '#6c7a58'],
  ['2022', 'Sel', 'Le sel et la cendre', '#8a6a3a'], ['2022', 'Kora', 'Kora, saison 2', '#3d4f8a'], ['2021', 'Vela', 'Vela, spot', '#8a4a58'],
  ['2021', 'Orme', 'Orme et fils', '#5b5f55'], ['2021', 'Lumo', 'Lumo, publicité', '#7a6a4a'], ['2020', 'Brise', 'Brise du soir', '#4a6a5a'],
  ['2020', 'Pivot', 'Pivot', '#5a4a6a'], ['2020', 'Talo', 'Talo, clip', '#8a7a3a'], ['2019', 'Ferro', 'Ferro, auto', '#4a4f5a'],
  ['2019', 'Nacre', 'Nacre', '#6a5a5a'], ['2019', 'Quai', 'Quai nord', '#4a5a6a'], ['2018', 'Pluma', 'Pluma, doc', '#5f6a4a'], ['2018', 'Ocre', 'Ocre', '#8a5a3a'],
];

export function initSpines() {
  const el = document.getElementById('spines');
  const html = rows.map(([y, w, t, c]) =>
    `<div class="spine"><div class="still" style="--sc:${c}"></div><div class="yr">${y}</div><div class="wm">${w}</div><div class="tt">${t}</div></div>`).join('');
  const track = document.createElement('div');
  track.style.cssText = 'display:flex;gap:.15vw;flex:none';
  track.innerHTML = html + html;
  el.appendChild(track);
  if (reduced) return;
  const tw = gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
  // scroll speeds the strip up, then it eases back to idle
  ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: (st) => {
    gsap.to(tw, { timeScale: 1 + Math.min(Math.abs(st.getVelocity()) / 300, 6), duration: 0.2, overwrite: true });
    gsap.to(tw, { timeScale: 1, duration: 1.2, delay: 0.2 });
  } });
}
