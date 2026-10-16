/**
 * theme.js - the fixed chrome (logo, vertical mono labels) takes each section's ink colour.
 * Technique: ScrollTrigger per section toggles body `--ink` when the section crosses 50% of the viewport.
 */
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initTheme() {
  document.querySelectorAll('.sec[data-ink]').forEach((s) => {
    ScrollTrigger.create({
      trigger: s, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => { if (self.isActive) document.body.style.setProperty('--ink', s.dataset.ink); },
    });
  });
}
