// Technique: pinned (sticky 600vh) mineral picker. Scroll progress -> active index; a 180-tick ring fills
// clockwise per mineral (scrubbed), the list highlights the active name, the rock image cross-fades.
// Values: 180 ticks, 2deg apart; ring tick colour #d9dbd9 -> #151515; list item colour transition .5s.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';
const M = [['Copper', 'CU', 29, 'copper'], ['Nickel', 'NI', 28, 'nickel'], ['Zinc', 'ZN', 30, 'zinc'], ['Iron', 'FE', 26, 'iron'], ['Tin', 'SN', 50, 'tin']];
export function initMinerals() {
  const ol = document.querySelector('.min-list ol'), ticks = document.querySelector('.ticks'), rock = document.querySelector('.rock');
  const code = document.querySelector('.min-code');
  M.forEach(([n, , , f]) => {
    ol.insertAdjacentHTML('beforeend', `<li>${n}</li>`);
    rock.insertAdjacentHTML('beforeend', `<img src="${import.meta.env.BASE_URL}img/min-${f}.webp" alt="">`);
  });
  const N = 180;
  for (let i = 0; i < N; i++) ticks.insertAdjacentHTML('beforeend', `<i style="transform:rotate(${(i * 360) / N}deg)"></i>`);
  const lis = [...ol.children], imgs = [...rock.children], tk = [...ticks.children];
  let cur = -1;
  const set = (p) => {
    const i = Math.min(M.length - 1, Math.floor(p * M.length));
    if (i !== cur) {
      cur = i;
      lis.forEach((l, k) => l.classList.toggle('on', k === i));
      imgs.forEach((m, k) => m.classList.toggle('on', k === i));
      code.textContent = `${M[i][1]} [#${M[i][2]}]`;
    }
    const lit = Math.round(((p * M.length) % 1 || (p >= 1 ? 1 : 0)) * N);
    tk.forEach((t, k) => t.classList.toggle('on', k < lit));
  };
  set(0);
  if (reduced) return;
  ScrollTrigger.create({ trigger: '.minerals', start: 'top top', end: 'bottom bottom', onUpdate: (s) => set(s.progress) });
}
