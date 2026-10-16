/*
 * THEME FLIP: sand/ink swap on fixed UI.
 *
 * Sections carry bg="dark|light|color". For every fixed UI element we create
 * one ScrollTrigger per section whose start/end are the viewport Y of the
 * element's own vertical midpoint:
 *      start: `top ${midY}px`   end: `bottom ${midY}px`
 * so the element flips exactly when a section boundary crosses *its* centre,
 * never earlier or later (header at 38px, sound toggle near the bottom, ...).
 * Pinned scenes that change colour mid-pin call setThemeAll() directly.
 */
import { ScrollTrigger } from './gsap.js';

const bindings = [];
const CLS = ['theme_on-light', 'theme_on-dark', 'theme_on-color'];

function apply(el, theme) {
  if (el.dataset.themeLock) return;
  CLS.forEach((c) => el.classList.toggle(c, c === 'theme_on-' + theme));
}

export function bindTheme(el) {
  const b = { el, triggers: [] };
  bindings.push(b);
  build(b);
  return b;
}

function build(b) {
  b.triggers.forEach((t) => t.kill());
  b.triggers = [];
  const r = b.el.getBoundingClientRect();
  const midY = Math.round(r.top + r.height / 2);
  document.querySelectorAll('[bg]').forEach((sec) => {
    b.triggers.push(
      ScrollTrigger.create({
        trigger: sec,
        start: `top ${midY}px`,
        end: `bottom ${midY}px`,
        onToggle: (self) => self.isActive && apply(b.el, sec.getAttribute('bg')),
      })
    );
  });
}

export function setThemeAll(theme) { bindings.forEach((b) => apply(b.el, theme)); }
export function refreshThemes() { bindings.forEach(build); }
