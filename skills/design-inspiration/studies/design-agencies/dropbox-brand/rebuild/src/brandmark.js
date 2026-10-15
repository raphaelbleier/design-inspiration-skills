/*
 * The invented "Cairn" mark: three stacked pill-shaped stones.
 * Built from three <rect>s with pathLength="1" so the load-in can draw each
 * outline with a plain stroke-dashoffset 1 -> 0 (technique: dash = whole path,
 * offset = whole path, animate offset to 0). vector-effect keeps the stroke 1px
 * no matter how large the svg is scaled.
 */
export const markSVG = (cls = '') => `
<svg class="mark ${cls}" viewBox="0 0 120 120" aria-hidden="true">
  <rect class="stone s3" x="38" y="6" width="44" height="30" rx="15" pathLength="1"/>
  <rect class="stone s2" x="20" y="42" width="80" height="32" rx="16" pathLength="1"/>
  <rect class="stone s1" x="4" y="80" width="112" height="34" rx="17" pathLength="1"/>
</svg>`;
