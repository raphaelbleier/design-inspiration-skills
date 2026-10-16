/* Wires loader -> ice shader -> stage track -> HUD. One gsap.ticker drives everything. */
import gsap from 'gsap';
import { runLoader } from './loader.js';
import { createIce } from './ice.js';
import { createDraw } from './draw.js';
import { createStages } from './stages.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const N = 5;
const $ = (id) => document.getElementById(id);

let xp = 0, burst = 0;
const draw = createDraw({ onZero(x, y) {
  xp += 50; $('xp').textContent = xp; burst = 1;
  const pop = Object.assign(document.createElement('div'), { className: 'zero-pop', textContent: '0' });
  pop.style.left = x + 'px'; pop.style.top = y + 'px'; document.body.append(pop);
  gsap.fromTo(pop, { scale: 0.4, opacity: 1 }, { scale: 2.2, opacity: 0, duration: 1, ease: 'power3.out', onComplete: () => pop.remove() });
} });
const ice = createIce($('gl'), draw.canvas);

$('ticks').innerHTML = ['-100', '-75', '-50', '-25', '0'].map((t) => `<span>${t}</span>`).join('');
const tickEls = [...$('ticks').children];
const ring = $('ring'); const temp = $('temp'); const hint = $('hint');
let lastIdx = -1;

const stages = createStages(N, (p, cur, settled) => {
  ice.u.uTemp.value = p;
  temp.textContent = Math.round(-100 + p * 100);
  const idx = Math.round(cur);
  if (idx !== lastIdx) { lastIdx = idx; tickEls.forEach((t, i) => t.classList.toggle('on', i === idx)); if (idx > 0) hint.style.opacity = 0; }
  ring.style.strokeDashoffset = 188.5 * (1 - (cur - Math.floor(cur)));   // progress to next stage
});
window.__scrollTo = (p) => stages.go(p * (N - 1)); // capture hook
$('nextBtn').onclick = () => stages.go(stages.index + 1);

const wave = $('wave');
$('audio').onclick = (e) => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); };

runLoader(reduced).then(() => {
  gsap.from('.hud, .hud-status', { opacity: 0, y: -12, duration: 0.8, ease: 'power3.out' });
});
gsap.ticker.lagSmoothing(0);
gsap.ticker.add((time, dt) => {
  burst *= 0.94; ice.u.uBurst.value = burst;
  draw.fade();
  stages.update(dt / 1000);
  const a = reduced ? 0 : 3 + Math.sin(time * 3) * 3;
  wave.setAttribute('points', [0, 4, 8, 12, 16, 20, 24].map((x, i) => `${x},${6 + (i % 2 ? a : -a) * Math.sin(time * 4 + i)}`).join(' '));
  ice.render(reduced ? 0 : time);
});
