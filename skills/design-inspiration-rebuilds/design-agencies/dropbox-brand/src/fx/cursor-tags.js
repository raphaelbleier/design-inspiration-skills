/*
 * Multiplayer-style cursor tag: the brand borrows the product's collaboration UI.
 * Pill = background var(--ct-background), text var(--ct-foreground), padding 4px 8px 4px 4px,
 * radius 10px, 14px / wght 500, 24px round initials badge, 20px arrow pointer pinned at
 * top:-12px; left:-12px. Colour transitions 0.3s ease-in-out.
 */
const ARROW = `<svg class="ct-ptr" viewBox="0 0 20 20" aria-hidden="true"><path d="M2 2l15 6.2-6.3 2.1L8.4 17z" fill="currentColor"/></svg>`;
export function cursorTag({ name, initials, id = 'purple', right = false }) {
  const el = document.createElement('div');
  el.className = 'ct' + (right ? ' ct-c-right' : '');
  el.style.setProperty('--ct-background', `var(--id-${id})`);
  el.style.setProperty('--ct-foreground', `var(--on-${id})`);
  el.innerHTML = `${ARROW}<span class="ct-ic">${initials ?? name.slice(0, 2).toUpperCase()}</span><span class="ct-name">${name}</span>`;
  return el;
}
