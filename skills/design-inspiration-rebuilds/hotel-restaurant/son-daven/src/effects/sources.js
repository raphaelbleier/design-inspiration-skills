/*
 * Texture sources for the halftone scenes. Each is a normal <img> decoded up-front, so the
 * preloader's percent counter can wait for them and shaders never sample an empty texture.
 */
import { img } from '../core/dom.js';

const NAMES = ['hero', 'ridge', 'tree', 'sheep', 'summer', 'winter', 'blog2'];

export async function loadSources() {
  const out = {};
  await Promise.all(NAMES.map(async (n) => {
    const el = new Image();
    el.src = img(n + '.webp');
    try { await el.decode(); } catch { /* missing file: scene simply stays empty */ }
    out[n] = el;
  }));
  return out;
}
