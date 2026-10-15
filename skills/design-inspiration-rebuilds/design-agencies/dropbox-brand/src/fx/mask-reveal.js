/*
 * Outline -> fill headline reveal (Color + Motion pages).
 * Every word is wrapped in a span that carries its text twice:
 *   - the real text, transparent with a 1px -webkit-text-stroke (the "outline" layer)
 *   - an ::after copy, solid colour, masked with a 200%-wide hard-edged gradient
 *     (left half opaque / right half transparent)
 * Moving mask-position from 100% 0 (nothing visible) to 0% 0 (all visible) wipes the solid fill across the word.
 * Words are revealed one after another: the global progress is split by cumulative letter counts, so a
 * longer word takes proportionally longer; easeOutQuad (t*(2-t)) shapes each word.
 * Inline swatches (<i class="sw">) count as one "letter" and fade/scale in with their word.
 */
import { easeOutQuad, clamp } from '../easing.js';
export function splitWords(el) {
  const nodes = [...el.childNodes];
  el.textContent = '';
  const words = [];
  for (const n of nodes) {
    if (n.nodeType === 3) {
      n.textContent.split(/(\s+)/).forEach((tok) => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { el.append(' '); return; }
        const s = document.createElement('span'); s.className = 'w'; s.dataset.w = tok; s.textContent = tok; el.append(s); words.push(s);
      });
    } else { el.append(n); if (n.classList?.contains('sw')) words.push(n); }
  }
  const lens = words.map((w) => (w.dataset.w ? w.dataset.w.length : 1));
  const total = lens.reduce((a, b) => a + b, 0);
  let acc = 0;
  const spans = words.map((w, i) => { const a = acc / total; acc += lens[i]; return { w, a, b: acc / total }; });
  return {
    words, spans,
    update(g) {
      for (const { w, a, b } of spans) {
        const p = easeOutQuad(clamp((g - a) / (b - a)));
        if (w.dataset.w) w.style.setProperty('--mp', `${100 * (1 - p)}%`);
        else w.style.setProperty('--p', p);
      }
    },
    /** global progress at which word i starts (for triggering background stages) */
    startOf: (i) => spans[i].a,
  };
}
