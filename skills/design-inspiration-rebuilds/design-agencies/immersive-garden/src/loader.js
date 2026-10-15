/* INTRO LOADER
   Fixed #e8e8e8 layer (z 1010) with the logo, the baseline and a 0-100 counter. Its three items
   sit exactly where the home intro's items sit, so when the layer's background fades the
   identical DOM underneath takes over without a visible jump.
   Timeline (values from the studied site):
     logo reveal    clip-path inset(0 100% 0 0) -> inset(0)   2.5 s  quart.out   (original: mask rect x -66% -> 0)
     baseline words opacity 0 -> 1, stagger .1 s              1.0 s  sine.inOut
     counter        opacity 0 -> 1                            0.8 s
     progress       current += (target - current) * 0.1 per 60fps tick; target = min(real, time-based)
     hide           bg opacity 1 -> 0                         1.2 s  sine.inOut
   After it: relief canvas fades in 1.75 s sine.inOut and settles from scale 1.06 in 2 s power1.out
   (original: view.fade 1.75 s, camera zoom 2 s). Scroll is locked until the loader is gone. */
import { gsap } from 'gsap';
import { state } from './state.js';
import { logoMarkup } from './logo.js';
import { stop, start } from './scroll.js';

export function runLoader({ assets = [], onDone }) {
  const el = document.getElementById('loader');
  const logo = el.querySelector('[data-logo]'); logo.innerHTML = logoMarkup();
  const words = el.querySelectorAll('.intro__base span');
  const count = document.getElementById('loader-count');
  const line = el.querySelector('.loader__line i');
  const canvas = document.getElementById('gl');
  stop();

  if (state.reduced) {
    document.body.classList.add('is-ready');
    gsap.to(el, { opacity: 0, duration: 0.3, onComplete: () => { el.remove(); start(); onDone?.(); } });
    return;
  }

  gsap.set(canvas, { opacity: 0, scale: 1.06 });
  gsap.set(logo, { clipPath: 'inset(0 100% 0 0)' });
  gsap.set(words, { opacity: 0 });
  gsap.set(count.parentNode, { opacity: 0 });
  gsap.timeline()
    .to(logo, { clipPath: 'inset(0 0% 0 0)', duration: 2.5, ease: 'quart.out' }, 0.2)
    .to(words, { opacity: 1, duration: 1, stagger: 0.1, ease: 'sine.inOut' }, 0.6)
    .to(count.parentNode, { opacity: 1, duration: 0.8 }, 1.2);

  let real = 0, cur = 0, done = false; const t0 = performance.now();
  Promise.all(assets.map((u) => new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = u; }).then(() => { real += 100 / assets.length; })))
    .then(() => { real = 100; });
  document.fonts.ready.then(() => { real = Math.max(real, 12); });

  const tick = () => {
    const timeT = Math.min(100, ((performance.now() - t0) / 2600) * 100);
    const target = Math.min(real, timeT);
    cur += (target - cur) * 0.1;
    count.textContent = Math.round(cur);
    line.style.transform = `scaleX(${cur / 100})`;
    if (!done && cur > 99.4) {
      done = true; gsap.ticker.remove(tick); count.textContent = 'Scroll down';
      count.parentNode.classList.add('intro__scroll');
      gsap.to(el, { backgroundColor: 'rgba(232,232,232,0)', duration: 1.2, ease: 'sine.inOut' });
      gsap.to(canvas, { opacity: 1, duration: 1.75, ease: 'sine.inOut' });
      gsap.to(canvas, { scale: 1, duration: 2, ease: 'power1.out', onComplete: () => { canvas.style.transform = ''; } });
      gsap.delayedCall(1.25, () => { document.body.classList.add('is-ready'); el.remove(); start(); onDone?.(); });
    }
  };
  gsap.ticker.add(tick);
}
