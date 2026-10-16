/* Header colour + side dots. Every <section data-theme> flips the header between white (over dark
   green) and ink (over mint) as it crosses the 36px line; the hero flips to ink once the white
   bloom has taken over (kv progress > .62). The 6 dots track the chapter under the viewport centre. */
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initTheme() {
  const root = document.documentElement;
  const secs = [...document.querySelectorAll('[data-theme]')].filter((s) => s.tagName === 'SECTION' || s.tagName === 'FOOTER');
  const kv = document.querySelector('#kv');
  const dotSecs = ['concept', 'oxygen', 'science', 'product', 'interview', 'scenes'].map((id) => document.getElementById(id));
  const dots = [...document.querySelectorAll('.dots li')];
  const tick = () => {
    const cur = secs.find((s) => { const r = s.getBoundingClientRect(); return r.top <= 36 && r.bottom > 36; });
    let theme = cur?.dataset.theme || 'dark';
    if (cur === kv) { const r = kv.getBoundingClientRect(); theme = -r.top / (r.height - innerHeight) > 0.62 ? 'light' : 'dark'; }
    if (root.dataset.theme !== theme) root.dataset.theme = theme;
    const mid = innerHeight / 2;
    const act = dotSecs.findIndex((s) => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
    dots.forEach((d, i) => d.classList.toggle('on', i === act));
    root.classList.toggle('in-chapters', act > -1);
  };
  addEventListener('scroll', tick, { passive: true }); addEventListener('resize', tick);
  ScrollTrigger.addEventListener('refresh', tick); tick();
}
