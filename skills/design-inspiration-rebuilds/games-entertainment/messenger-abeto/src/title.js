/**
 * Title: 9 extruded block letters in a 3x3 grid (LET / TER / BOX), the way the original stacks its name.
 *
 * Each glyph is a 6x8 bitmap of thick strokes; every set cell becomes a box, all merged into one mesh per letter
 * (depth 1.6 cells). Coplanar faces share a normal, so the ink pass (outline.js) draws lines only on the silhouette
 * and in the notches - exactly the "carved slab" look of the original.
 *  - Colour #F8F8F8, toon-lit so the extruded sides read as grey.
 *  - Block is parented to the camera so it stays screen-fixed while the planet turns behind it.
 *  - Stepped boil: every 0.14s each letter gets a tiny random rotation/offset (stop-motion wobble).
 *  - Hover: the letter under the pointer pushes forward (z +1.4 cells) in 0.07s steps.
 *  - Mouse parallax: group rotation follows the pointer by +-0.01 rad (camera displacement target in the original).
 *  - Play-in: letters scale 0 -> 1 with elastic.out, 0.08s apart, starting at 2.35s.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const G = {
  L: ['XX....', 'XX....', 'XX....', 'XX....', 'XX....', 'XX....', 'XXXXXX', 'XXXXXX'],
  E: ['XXXXXX', 'XXXXXX', 'XX....', 'XXXXXX', 'XXXXXX', 'XX....', 'XXXXXX', 'XXXXXX'],
  T: ['XXXXXX', 'XXXXXX', '..XX..', '..XX..', '..XX..', '..XX..', '..XX..', '..XX..'],
  R: ['XXXXXX', 'XXXXXX', 'XX..XX', 'XXXXXX', 'XXXXX.', 'XX.XX.', 'XX..XX', 'XX..XX'],
  B: ['XXXXXX', 'XXXXXX', 'XX..XX', 'XXXXXX', 'XXXXXX', 'XX..XX', 'XXXXXX', 'XXXXXX'],
  O: ['XXXXXX', 'XXXXXX', 'XX..XX', 'XX..XX', 'XX..XX', 'XX..XX', 'XXXXXX', 'XXXXXX'],
  X: ['XX..XX', 'XX..XX', '.XXXX.', '..XX..', '..XX..', '.XXXX.', 'XX..XX', 'XX..XX'],
};
export const TITLE = 'LETTERBOX';
export const BLOCK_W = 20, BLOCK_H = 26; // cells (3 glyphs of 6 + 2 gaps of 1; 3 rows of 8 + 2 gaps)

function glyph(ch, mat) {
  const boxes = [];
  G[ch].forEach((row, y) => [...row].forEach((c, x) => {
    if (c !== 'X') return;
    const b = new THREE.BoxGeometry(1, 1, 2.2); b.translate(x - 2.5, 3.5 - y, 0); boxes.push(b.toNonIndexed());
  }));
  const geo = mergeGeometries(boxes.map((b) => { b.deleteAttribute('uv'); return b; }));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

export function buildTitle(toon) {
  const mat = new THREE.MeshToonMaterial({ color: '#F8F8F8', gradientMap: toon });
  const root = new THREE.Group(), block = new THREE.Group(); root.add(block);
  const letters = [...TITLE].map((ch, i) => {
    const m = glyph(ch, mat), col = i % 3, row = (i / 3) | 0;
    m.userData.home = new THREE.Vector3((col - 1) * 7, (1 - row) * 9, 0);
    m.position.copy(m.userData.home); m.userData.pop = 0; block.add(m); return m;
  });
  return { root, block, letters };
}
