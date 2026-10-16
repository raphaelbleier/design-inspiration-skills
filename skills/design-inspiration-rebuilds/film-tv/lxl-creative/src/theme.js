// Technique: section-driven body theme. Each section declares data-theme; when it crosses the
// viewport centre the body background + text colour tween to that theme (0.6s, ease none).
// The fixed nav separately flips colour per [data-nav-theme] section (top top -> bottom top).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const themes = { dark: { backgroundColor: '#27201d', color: '#fcf2bd' }, light: { backgroundColor: '#fcf2bd', color: '#27201d' } };

export function initTheme() {
  document.querySelectorAll('[data-theme]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top center', end: 'bottom center',
      onToggle: ({ isActive }) => isActive && gsap.to('body, html', { ...themes[el.dataset.theme], duration: 0.6, ease: 'none', overwrite: 'auto' }),
    });
  });
  const nav = document.querySelector('[data-nav]');
  document.querySelectorAll('[data-nav-theme]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top top', end: 'bottom top',
      onToggle: ({ isActive }) => { nav.dataset.themeNav = isActive ? el.dataset.navTheme : 'dark'; },
    });
  });
  // wordmark in the nav appears once the giant hero wordmark has scrolled away
  const logo = document.querySelector('[data-logo]');
  const trigger = document.querySelector('[data-logo-trigger]');
  gsap.set(logo, { autoAlpha: 0, y: -16 });
  ScrollTrigger.create({
    trigger, start: 'bottom top',
    onEnter: () => gsap.to(logo, { autoAlpha: 1, y: 0, duration: 0.65, ease: 'osmo', overwrite: 'auto' }),
    onLeaveBack: () => gsap.to(logo, { autoAlpha: 0, y: -16, duration: 0.65, ease: 'osmo', overwrite: 'auto' }),
  });
}
