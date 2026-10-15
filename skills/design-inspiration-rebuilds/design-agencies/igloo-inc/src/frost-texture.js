/**
 * Procedural stand-in for the original "scroll-datatexture" (a baked ice/frost map).
 *
 * TECHNIQUE: one RGBA data texture drives the whole frost wipe:
 *   R = ice cut (crystalline cell edges + fbm; shifts WHERE the diagonal wipe edge is)
 *   G = "tech" displacement (blocky random cells -> pixel-dragging glitch)
 *   B = slope displacement (smooth fbm; bends the wipe edge)
 * 512x512, repeat wrapped, generated once in JS (~40 ms).
 */
import * as THREE from 'three';

function hash(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + s * 1274126177) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vnoise(x, y, s, period) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const w = (n) => ((n % period) + period) % period;
  const a = hash(w(xi), w(yi), s), b = hash(w(xi + 1), w(yi), s);
  const c = hash(w(xi), w(yi + 1), s), d = hash(w(xi + 1), w(yi + 1), s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, s, period) {
  let a = 0.5, sum = 0, p = period;
  for (let i = 0; i < 5; i++) {
    sum += a * vnoise((x * p) / period, (y * p) / period, s + i, p);
    p *= 2; a *= 0.5;
  }
  return sum;
}

export function createFrostTexture(size = 512) {
  const data = new Uint8Array(size * size * 4);
  // jittered voronoi points for the crystal edges
  const cells = 14;
  const pts = [];
  for (let j = 0; j < cells; j++) for (let i = 0; i < cells; i++) pts.push([i + hash(i, j, 1), j + hash(i, j, 2)]);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size;
      // voronoi F2-F1 edge
      const gx = u * cells, gy = v * cells;
      let d1 = 9, d2 = 9;
      const ci = Math.floor(gx), cj = Math.floor(gy);
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const ii = (ci + di + cells) % cells, jj = (cj + dj + cells) % cells;
        const px = ii + hash(ii, jj, 1) + (ci + di - ii), py = jj + hash(ii, jj, 2) + (cj + dj - jj);
        const d = Math.hypot(gx - px, gy - py);
        if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
      }
      const edge = 1 - Math.min(1, (d2 - d1) * 3);
      const r = Math.min(1, fbm(u, v, 3, 4) * 0.8 + edge * 0.35);
      const block = hash(Math.floor(u * 24), Math.floor(v * 40), 9);
      const b = fbm(u, v, 7, 3);
      const i = (y * size + x) * 4;
      data[i] = r * 255; data[i + 1] = block * 255; data[i + 2] = b * 255; data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
