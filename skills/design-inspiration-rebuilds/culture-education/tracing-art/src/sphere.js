// Technique: Three.js - 150 image planes on a Fibonacci sphere (radius 2.3). Scroll progress drives
// assembly (random scatter -> sphere over the first 35%) and rotation (one full turn on Y).
// Planes always face the camera; opacity falls with depth (back side .15, front 1). Cursor tilts the group.
import * as THREE from 'three';
import { works, src } from './data.js';
import { onFrame, reduced } from './scroll.js';

export function initSphere() {
  const sec = document.querySelector('#sphere'), canvas = sec.querySelector('#gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 50); cam.position.z = 11;
  const group = new THREE.Group(); scene.add(group);
  const loader = new THREE.TextureLoader();
  const mats = [];   // materials per artwork; the map is attached only once the image really loads
  const tex = works.map((w, k) => { const t = loader.load(src(w), () => { mats[k].forEach((m) => { m.map = t; m.color.set(0xffffff); m.needsUpdate = true; }); }, undefined, () => {}); t.colorSpace = THREE.SRGBColorSpace; mats[k] = []; return t; });
  const N = 150, items = [];
  const rnd = (a) => (Math.sin(a * 91.7) * 43758.5453) % 1;   // deterministic scatter
  for (let i = 0; i < N; i++) {
    const k = i % works.length, w = works[k], [a, b] = w.ar.split('/').map(Number);
    const h = 0.34, wd = h * (a / b);
    const mat = new THREE.MeshBasicMaterial({ color: 0xd8d3cb, transparent: true });
    mats[k].push(mat);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(wd, h), mat);
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
    const to = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(2.3 * (0.55 + 0.45 * Math.sqrt(Math.abs(rnd(i + 1)))));
    const from = new THREE.Vector3(rnd(i + 2) * 12, rnd(i + 3) * 8, rnd(i + 4) * 6);
    items.push({ m, to, from });
    group.add(m);
  }
  let progress = 0, shown = 0, tx = 0, ty = 0, mx = 0, my = 0;
  const wp = new THREE.Vector3(), inv = new THREE.Quaternion();

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); cam.aspect = w / h;
    cam.position.z = w < 700 ? 16 : 11; cam.updateProjectionMatrix();
  };
  resize(); addEventListener('resize', resize);
  addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

  onFrame((t) => {
    const r = sec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    progress = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    shown += (progress - shown) * (reduced ? 1 : 0.08);
    const asm = Math.min(1, shown / 0.35), e = 1 - Math.pow(1 - asm, 3);
    tx += (mx * 0.5 - tx) * 0.05; ty += (my * 0.4 - ty) * 0.05;
    group.rotation.set(ty, shown * Math.PI * 2 + tx + (reduced ? 0 : t * 0.05), 0);
    inv.copy(group.quaternion).invert().multiply(cam.quaternion);   // billboard inside the rotated group
    group.updateMatrixWorld();
    items.forEach(({ m, to, from }) => {
      m.position.lerpVectors(from, to, e);
      m.quaternion.copy(inv);
      m.getWorldPosition(wp);
      m.material.opacity = (0.15 + 0.85 * THREE.MathUtils.smoothstep(wp.z, -2.3, 2.3)) * Math.min(1, e * 1.5);
    });
    renderer.render(scene, cam);
  });
}
