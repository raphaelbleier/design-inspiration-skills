/**
 * theme.js - recolours the fixed topo canvas + the header per section.
 *
 * <section data-theme="dark|cream|none" data-header="light|dark">
 *   data-theme  : colour set the shader tweens to when the section reaches the viewport middle
 *   data-header : header ink colour (light = white ink on dark backgrounds)
 * The gallery additionally scrubs dark -> cream (see gallery.js via setThemeMix).
 */
import { gsap, ScrollTrigger } from './scroll.js';
import { rawColor } from './topo.js';

const THEMES = {
  dark:  { bg: '#282c20', line: '#3a3f2d', density: 9 },
  cream: { bg: '#f4f4ed', line: '#d7d7cb', density: 7 },
};

export function initTheme(topo) {
  const u = topo.uniforms;
  const state = { mix: 0 };                       // 0 = dark, 1 = cream (scrubbable)
  const a = rawColor('#000'), b = rawColor('#000');
  const apply = () => {
    a.copy(rawColor(THEMES.dark.bg)); b.copy(rawColor(THEMES.cream.bg));   u.uBg.value.copy(a).lerp(b, state.mix);
    a.copy(rawColor(THEMES.dark.line)); b.copy(rawColor(THEMES.cream.line)); u.uLine.value.copy(a).lerp(b, state.mix);
    u.uDensity.value = THEMES.dark.density + (THEMES.cream.density - THEMES.dark.density) * state.mix;
  };
  apply();

  // triggers are created in start(), AFTER pins exist, so their positions include pin spacers
  function start() {
  document.querySelectorAll('[data-theme]').forEach((sec) => {
    const to = sec.dataset.theme === 'cream' ? 1 : sec.dataset.theme === 'dark' ? 0 : null;
    if (to === null) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 55%', end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive && !sec.hasAttribute('data-theme-scrub')) tween(to); },
      onEnter: () => {}, onEnterBack: () => {},
    });
  });
  function tween(to) { gsap.to(state, { mix: to, duration: 0.75, ease: 'power2.inOut', onUpdate: apply, overwrite: 'auto' }); }

  // header ink
  const header = document.querySelector('.header');
  document.querySelectorAll('[data-header]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 45px', end: 'bottom 45px',
      onToggle: (self) => self.isActive && header.setAttribute('data-ink', sec.dataset.header),
    });
  });
  // header shrinks after the first scroll
  ScrollTrigger.create({ start: 40, end: 'max', onToggle: (s) => header.classList.toggle('is-small', s.isActive) });
  }

  return { state, apply, start };
}
