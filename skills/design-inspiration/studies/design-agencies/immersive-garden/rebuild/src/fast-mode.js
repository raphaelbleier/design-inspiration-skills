/* FAST / SLOW SCROLL MODES
   Sustained hard scrolling (state.speed >= 0.99) toggles <body class="is-fast">; it reverts
   below 0.75, or 1 s after the scroll hits either end of the page.
   Visual changes are CSS (see styles.css, "Fast mode"):
     text blocks  scale(.5) + opacity 0          1.5 s  cubic-bezier(.2,0,0,1)   (slow: 1.3 s (.4,0,0,1))
     media        scale(.5), alternate sideways shift
     UI           menu / all projects / sound fade out in .5 s
     titles       a fixed index of huge serif project names, the active one follows the scroll
     relief       uFast -> 1 (whitened, fully extruded, zoomed out)  via relief.setFast()
   Titles list: translateY lerps (0.08) toward -(activeIndex * rowHeight); the active index is the
   project block whose centre is nearest the viewport centre. */
import { state } from './state.js';
import { gsap } from 'gsap';
import { homeProjects } from './data.js';

let relief, titles, list, lis = [], blocks = [], limitTimer = 0, ty = 0;

export function mountFast() {
  titles = document.getElementById('titles'); if (!titles) return;
  list = titles.querySelector('ol'); lis = [...list.children];
  blocks = [...document.querySelectorAll('.pblock')];
}

function set(on) {
  if (state.fast === on) return;
  state.fast = on;
  document.body.classList.toggle('is-fast', on);
  relief?.setFast(on);
}

/** exposed on window.__studio.fast for manual QA (no synthetic wheel needed) */
let forced = false;
export const forceFast = (on) => { forced = on; set(on); };

export function initFastMode(reliefApi) {
  relief = reliefApi;
  if (state.reduced) return;
  gsap.ticker.add(() => {
    if (document.body.dataset.route !== 'home' || document.body.classList.contains('about-open')) { set(false); return; }
    if (!state.fast && state.speed >= 0.99) set(true);
    else if (state.fast && !forced && state.speed < 0.75) set(false);
    const max = document.documentElement.scrollHeight - innerHeight;
    const atEnd = state.scroll <= 1 || state.scroll >= max - 1;
    if (state.fast && !forced && atEnd && !limitTimer) limitTimer = setTimeout(() => { limitTimer = 0; if (state.scroll <= 1 || state.scroll >= max - 1) set(false); }, 1000);
    if (state.fast && lis.length) {
      let best = 0, bd = Infinity;
      blocks.forEach((b, i) => { const r = b.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - innerHeight / 2); if (d < bd) { bd = d; best = i; } });
      const row = lis[0].offsetHeight;
      ty += (-(best + .5) * row - ty) * 0.08;
      list.style.transform = `translateY(${ty}px)`;
      lis.forEach((li, i) => li.classList.toggle('is-active', i === best));
    }
  });
}
export const titlesMarkup = () => `<div id="titles" aria-hidden="true"><ol>${homeProjects.map((p) => `<li>${p.title}<img src="./img/${p.img[0]}.webp" alt=""></li>`).join('')}</ol></div>`;
