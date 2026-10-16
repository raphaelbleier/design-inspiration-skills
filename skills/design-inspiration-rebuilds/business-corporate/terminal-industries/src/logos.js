/**
 * logos.js - logo grid cells light up lime under the pointer; the glow follows the cursor
 * inside the cell via --mx/--my (radial-gradient centre). Grid hairlines extend one
 * cell above and below the row (CSS ::before/::after).
 */
export function initLogos() {
  document.querySelectorAll('[data-cell]').forEach((c) => {
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - r.left}px`);
      c.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}
