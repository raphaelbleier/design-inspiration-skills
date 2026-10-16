/**
 * The world: a flat-shaded low-poly planet with six biomes, built procedurally (the original loads ~100 Draco meshes).
 *
 * Look recipe (all of it matters):
 *  - IcosahedronGeometry(R=40, detail 6) converted toNonIndexed -> every face has its own normal = faceted look.
 *  - Per-face colours (no textures): biome palette + +-4% brightness noise per face.
 *  - MeshToonMaterial with a 3-step gradientMap (NearestFilter) = hard cel bands (0.27 / 0.69 / 1.0).
 *  - Props (buildings, trees, tanks, torii...) are merged into ONE geometry with vertex colours = 1 draw call.
 *  - Ink lines come from outline.js, not from the geometry.
 * Biomes (centre directions, warped by noise so borders are irregular): city, forest, factory, beach, temple, falls.
 * Roads are great circles through the city centre: a face is road when |dot(dir, circleNormal)| < 0.05.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from './stepped.js';

export const R = 40;
export const SEA = 0;
const V = (x, y, z) => new THREE.Vector3(x, y, z).normalize();
export const BIOMES = [
  { id: 'city', name: 'Harborside Hill', c: V(0, 0, 1) },
  { id: 'forest', name: 'Mossgate Woods', c: V(-1, 0.35, 0.1) },
  { id: 'factory', name: 'Kettle Works', c: V(1, 0.3, -0.25) },
  { id: 'beach', name: 'Saltgrass Cove', c: V(0.1, -1, 0.3) },
  { id: 'temple', name: 'Lantern Shrine', c: V(-0.2, 0.55, -1) },
  { id: 'falls', name: 'Thousand Falls', c: V(0.1, 1, -0.2) },
];
const ROADS = [V(1, 0, 0), V(0, 1, 0), V(1, 1, 0)].map((n) => n.normalize());

const hash3 = (x, y, z) => { const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return n - Math.floor(n); };
function noise3(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x - ix, fy = y - iy, fz = z - iz;
  const s = (t) => t * t * (3 - 2 * t), ux = s(fx), uy = s(fy), uz = s(fz);
  const l = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash3(ix + dx, iy + dy, iz + dz);
  return l(l(l(c(0, 0, 0), c(1, 0, 0), ux), l(c(0, 1, 0), c(1, 1, 0), ux), uy),
    l(l(c(0, 0, 1), c(1, 0, 1), ux), l(c(0, 1, 1), c(1, 1, 1), ux), uy), uz);
}
const fbm3 = (x, y, z) => noise3(x, y, z) * 0.6 + noise3(x * 2.1, y * 2.1, z * 2.1) * 0.3 + noise3(x * 4.3, y * 4.3, z * 4.3) * 0.1;

export function biomeIndex(d) {
  const w = 0.22; // domain warp -> irregular borders
  const x = d.x + (noise3(d.x * 3, d.y * 3, d.z * 3) - 0.5) * w, y = d.y + (noise3(d.y * 3 + 9, d.z * 3, d.x * 3) - 0.5) * w, z = d.z + (noise3(d.z * 3 + 5, d.x * 3, d.y * 3) - 0.5) * w;
  let best = 0, bd = -2;
  BIOMES.forEach((b, i) => { const dd = b.c.x * x + b.c.y * y + b.c.z * z; if (dd > bd) { bd = dd; best = i; } });
  return best;
}
const BIAS = [0.45, 0.8, 0.45, -0.7, 1.9, 2.4], AMP = [0.25, 1.4, 0.35, 1.6, 2.2, 3.4];
export function heightAt(d) {
  const b = biomeIndex(d);
  const n = fbm3(d.x * 2.6 + 3, d.y * 2.6 + 3, d.z * 2.6 + 3) - 0.5;
  return BIAS[b] + n * 2 * AMP[b];
}
export const roadDist = (d) => Math.min(...ROADS.map((n) => Math.abs(d.dot(n)))) ; // sine of angle to nearest road
export const groundR = (d) => R + Math.max(heightAt(d), SEA);

const PAL = {
  city: ['#8d9a8f', '#9aa597', '#a7ada0'], forest: ['#4f9a62', '#5aa86a', '#468a58'], factory: ['#85857f', '#7a7d78', '#8d8b84'],
  beach: ['#e3d3a0', '#d9c78e', '#8cc48c'], temple: ['#a8a08c', '#9d977f', '#4f755a'], falls: ['#4f755a', '#3a726b', '#9a937f'],
};
const col = (hex, k) => { const c = new THREE.Color(hex); return c.multiplyScalar(k); };

export function buildPlanet() {
  // ---- terrain -------------------------------------------------------------------------------------------
  const g = new THREE.IcosahedronGeometry(1, 6).toNonIndexed();
  const pos = g.attributes.position, colors = new Float32Array(pos.count * 3);
  const d = new THREE.Vector3(), cen = new THREE.Vector3();
  const rr = [], k = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    d.fromBufferAttribute(pos, i).normalize();
    pos.setXYZ(i, d.x * groundR(d), d.y * groundR(d), d.z * groundR(d));
  }
  for (let f = 0; f < pos.count; f += 3) {
    cen.set(0, 0, 0);
    for (let j = 0; j < 3; j++) cen.x += pos.getX(f + j), cen.y += pos.getY(f + j), cen.z += pos.getZ(f + j);
    cen.normalize();
    const h = heightAt(cen), bi = biomeIndex(cen), id = BIOMES[bi].id, p = PAL[id], r = hash3(f, 1, 2);
    const rd = roadDist(cen), cityW = BIOMES[0].c.dot(cen);
    let hex;
    if (h < SEA) hex = r > 0.5 ? '#6facb2' : '#75bdc3';
    else if (id === 'city' || cityW > 0.55) hex = rd < 0.05 ? '#52777d' : rd < 0.068 ? '#a9b8b0' : p[(r * 3) | 0];
    else if (id === 'beach') hex = h < 0.35 ? p[0] : h < 0.6 ? p[1] : p[2];
    else if (h > 3.2) hex = '#9a937f';
    else hex = p[(r * 3) | 0];
    k.copy(col(hex, 0.96 + r * 0.08));
    for (let j = 0; j < 3; j++) { colors[(f + j) * 3] = k.r; colors[(f + j) * 3 + 1] = k.g; colors[(f + j) * 3 + 2] = k.b; }
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();

  // ---- props ---------------------------------------------------------------------------------------------
  const rnd = mulberry32(2025), parts = [], obstacles = [];
  const up = new THREE.Vector3(0, 1, 0), m = new THREE.Matrix4(), q = new THREE.Quaternion(), yaw = new THREE.Quaternion();
  const add = (geo, hex, base, local) => {
    let x = geo.index ? geo.toNonIndexed() : geo; x.deleteAttribute('uv');
    x.applyMatrix4(local); x.applyMatrix4(base);
    x.computeVertexNormals();
    const c = new THREE.Color(hex), arr = new Float32Array(x.attributes.position.count * 3);
    for (let i = 0; i < arr.length; i += 3) { arr[i] = c.r; arr[i + 1] = c.g; arr[i + 2] = c.b; }
    x.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    parts.push(x);
  };
  const L = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) =>
    new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
  const box = (w, h, dp) => new THREE.BoxGeometry(w, h, dp);
  const cyl = (rt, rb, h, s = 6) => new THREE.CylinderGeometry(rt, rb, h, s);
  const ico = (r, dt = 0) => new THREE.IcosahedronGeometry(r, dt);
  const cone = (r, h, s = 6) => new THREE.ConeGeometry(r, h, s);
  const frame = (dir, y0) => { // base matrix: origin on terrain, +Y = surface normal, random yaw
    q.setFromUnitVectors(up, dir); yaw.setFromAxisAngle(up, rnd() * Math.PI * 2);
    return m.clone().compose(dir.clone().multiplyScalar(groundR(dir) + y0), q.clone().multiply(yaw), new THREE.Vector3(1, 1, 1));
  };
  const pick = (a) => a[(rnd() * a.length) | 0];
  const rndDir = (biome, spread) => {
    for (let t = 0; t < 40; t++) {
      const c = BIOMES[biome].c, v = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(spread * 2).add(c).normalize();
      if (biomeIndex(v) === biome && heightAt(v) > 0.25) return v;
    }
    return null;
  };
  const place = (biome, n, spread, minRoad, fn) => {
    for (let i = 0, ok = 0; ok < n && i < n * 6; i++) {
      const v = rndDir(biome, spread); if (!v || roadDist(v) < minRoad) continue;
      fn(v, frame(v, -0.15)); ok++;
    }
  };
  const obs = (v, r) => obstacles.push({ d: v.clone(), r });

  const WALL = ['#d9d4c3', '#b9c2b6', '#c9b6aa', '#e6dfcf', '#a9b0ad'], ROOF = ['#6f6b66', '#7d5f5a', '#4f6a6a', '#8a8f8c'];
  place(0, 130, 0.5, 0.15, (v, b) => {
    const w = 3 + rnd() * 3, hh = 3 + rnd() * 5, dp = 3 + rnd() * 3;
    add(box(w, hh, dp), pick(WALL), b, L(0, hh / 2, 0));
    add(cone(Math.max(w, dp) * 0.78, 1.4, 4), pick(ROOF), b, L(0, hh + 0.7, 0, 0, Math.PI / 4, 0, 1, 1, dp / w));
    add(box(w * 0.3, 1, 0.1), '#3d4a50', b, L(0, hh * 0.45, dp / 2 + 0.03));
    obs(v, Math.max(w, dp) * 0.7);
  });
  // utility poles along the roads
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2, v = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const d2 = new THREE.Vector3(v.x, 0.06, v.z).normalize();
    if (BIOMES[0].c.dot(d2) < 0.15 || heightAt(d2) < 0.2) continue;
    const b = frame(d2, -0.1);
    add(cyl(0.14, 0.18, 7.5), '#6b6358', b, L(2.9, 3.7, 0));
    add(box(2.2, 0.15, 0.15), '#6b6358', b, L(2.9, 6.9, 0));
  }
  const GREENS = ['#4f9a62', '#468a58', '#5aa86a', '#3f7d52'];
  place(1, 300, 0.55, 0, (v, b) => {
    const s = 0.8 + rnd() * 0.9;
    add(cyl(0.2 * s, 0.28 * s, 2 * s, 5), '#6b5a46', b, L(0, s, 0));
    add(ico(1.5 * s, 0), pick(GREENS), b, L(0, 3 * s, 0, 0, 0, 0, 1, 1.25, 1));
    add(ico(1.0 * s, 0), pick(GREENS), b, L(0, 4.4 * s, 0));
    obs(v, 0.5 * s);
  });
  place(2, 46, 0.45, 0, (v, b) => {
    const t = rnd();
    if (t < 0.3) { add(cyl(0.9, 1.1, 11, 8), '#d9d4c3', b, L(0, 5.5, 0)); add(cyl(0.95, 0.95, 1.6, 8), '#c25959', b, L(0, 10.2, 0)); obs(v, 1.4); }
    else if (t < 0.65) { add(cyl(2.6, 2.6, 3.6, 8), pick(['#de794e', '#c25959', '#a9b0ad']), b, L(0, 1.8, 0)); add(cyl(2.7, 2.2, 0.6, 8), '#6f6b66', b, L(0, 3.9, 0)); obs(v, 2.8); }
    else { const w = 4 + rnd() * 4; add(box(w, 3.2, 4), '#8d8b84', b, L(0, 1.6, 0)); add(box(w + 0.4, 0.4, 4.4), '#c25959', b, L(0, 3.4, 0)); obs(v, w * 0.6); }
  });
  place(3, 40, 0.5, 0, (v, b) => {
    if (rnd() < 0.5) { add(cyl(0.08, 0.08, 2.6, 5), '#e6dfcf', b, L(0, 1.3, 0)); add(cone(1.5, 0.7, 8), rnd() < 0.5 ? '#de794e' : '#f3c258', b, L(0, 2.7, 0)); }
    else { add(ico(0.9 + rnd() * 0.8, 0), '#9a937f', b, L(0, 0.4, 0, 0, 0, 0, 1.3, 0.8, 1)); obs(v, 1.2); }
  });
  place(4, 60, 0.4, 0, (v, b) => {
    const s = 1 + rnd();
    add(cyl(0.15 * s, 0.22 * s, 1.4 * s, 5), '#6b5a46', b, L(0, 0.7 * s, 0));
    add(cone(1.2 * s, 3.4 * s, 6), '#3a726b', b, L(0, 3 * s, 0)); obs(v, 0.5 * s);
  });
  { // torii gate + stair + pagoda at the temple centre
    const v = BIOMES[4].c.clone(), b = frame(v, 0);
    [-2.2, 2.2].forEach((x) => add(cyl(0.35, 0.4, 6, 6), '#c25959', b, L(x, 3, 6)));
    add(box(7, 0.5, 0.7), '#363a3c', b, L(0, 6.3, 6)); add(box(5.6, 0.35, 0.5), '#c25959', b, L(0, 5.2, 6));
    for (let i = 0; i < 6; i++) add(box(4 - i * 0.2, 0.4, 1.2), '#a8a08c', b, L(0, 0.2 + i * 0.4, 3.6 - i * 1.1));
    add(box(4, 3, 4), '#e6dfcf', b, L(0, 1.5, -4)); add(cone(4.2, 2, 4), '#c25959', b, L(0, 4, -4, 0, Math.PI / 4, 0));
    add(box(3, 2.4, 3), '#e6dfcf', b, L(0, 5.2, -4)); add(cone(3.2, 1.8, 4), '#c25959', b, L(0, 7.3, -4, 0, Math.PI / 4, 0));
    obstacles.push({ d: v.clone(), r: 4 });
  }
  place(5, 70, 0.45, 0, (v, b) => {
    const s = 1.5 + rnd() * 2.5;
    add(ico(s, 0), pick(['#9a937f', '#7f8a78', '#4f755a']), b, L(0, s * 0.7, 0, 0, 0, 0, 1, 1.6, 1));
    if (rnd() < 0.5) add(box(0.7, s * 1.8, 0.25), '#afe7eb', b, L(s * 0.7, s * 0.9, 0)); // waterfall ribbon
    obs(v, s);
  });

  const mergedGeo = mergeGeometries(parts, false);
  const toon = (() => { const t = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
  const mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toon });
  const group = new THREE.Group();
  group.add(new THREE.Mesh(g, mat), new THREE.Mesh(mergedGeo, mat));
  return { group, obstacles, toon };
}
