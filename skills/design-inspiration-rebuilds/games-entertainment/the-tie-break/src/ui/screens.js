/*
 * screens.js - Vue-<Transition>-style enter/leave for DOM groups.
 * .fx children get class `in` (opacity transition, per-element delay from data-d, see
 * style.css: 2 s fade, stagger .25/.36/.47/.58 s on enter, .3 s on leave).
 */
const fxs = (el) => (el.matches('.fx') ? [el] : [...el.querySelectorAll('.fx')])

export function show(el) {
  clearTimeout(el._t)
  el.classList.add('on')
  void el.offsetWidth
  requestAnimationFrame(() => fxs(el).forEach((n) => { n.style.setProperty('--d', (n.dataset.d || 0) + 's'); n.classList.add('in') }))
}
export function hide(el, ms = 450) {
  fxs(el).forEach((n) => n.classList.remove('in'))
  el._t = setTimeout(() => el.classList.remove('on'), ms)
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
