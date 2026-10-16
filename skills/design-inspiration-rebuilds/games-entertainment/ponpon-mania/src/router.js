/* Hash router with a curtain page transition.
 * The curtain is a 500vh-tall SVG: a solid band between two wavy edges. Translating it up passes the
 * band over the viewport: -35% = fully covering, -76% = fully gone. The view swaps at the covered moment.
 *   cover 0.7s power3.inOut -> swap -> reveal 0.7s power3.inOut
 */
import gsap from 'gsap';
import { setPalette } from './bg.js';

const views = ['home', 'chapters', 'about'];
const curtain = document.getElementById('curtain');
const hooks = {};
let current = null, busy = false;

export const onEnter = (v, fn) => ((hooks[v] ||= {}).enter = fn);
export const onLeave = (v, fn) => ((hooks[v] ||= {}).leave = fn);

function swap(to) {
  if (current) hooks[current]?.leave?.();
  document.querySelectorAll('.view').forEach((el) => el.classList.toggle('is-active', el.id === to));
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === to && a.classList.contains('hdr__link')));
  document.body.dataset.view = to;
  document.body.classList.remove('hdr-light');
  setPalette(to);
  current = to;
  hooks[to]?.enter?.();
}

export function go(to) {
  if (busy || to === current) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !current) { swap(to); return; }
  busy = true;
  gsap.timeline({ onComplete: () => { gsap.set(curtain, { yPercent: 0 }); busy = false; } })
    .to(curtain, { yPercent: -35, duration: 0.7, ease: 'power3.inOut' })
    .add(() => swap(to))
    .to(curtain, { yPercent: -76, duration: 0.7, ease: 'power3.inOut' }, '+=0.1');
}

const fromHash = () => (views.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home');
export function initRouter() {
  addEventListener('hashchange', () => go(fromHash()));
  swap(fromHash());
}
