/**
 * tunnel.js - "Our Units" room tunnel (Three.js).
 * A square corridor 6 wide x 60 deep, four walls cut into 2x2 cells (3 across, 30 along).
 * Each cell is cream (55%), a flat brand colour (25%) or a photo plane (20%, deeper than cell 3).
 * Black LineSegments draw every cell edge (the "perspective grid" look). Perspective fov 62.
 * "Press to Start" flies the camera z 3 -> -50 in 9s power2.inOut; pointer adds +-0.06 rad
 * parallax (lerp .06). Rendered inside the gsap ticker only while the card is on screen.
 * Reduced motion: static frame, button still flies with a 0.01s tween.
 */
import * as THREE from 'three';
import gsap from 'gsap';
import { reduced } from './scroll.js';

const PALETTE = [0xff6100, 0x00aa3c, 0xffb200, 0xab54f7, 0x0072e3, 0xea3737];
const HALF = 3, DEPTH = 60, CELL = 2, ACROSS = 3, ALONG = DEPTH / CELL;
const IMGS = Array.from({ length: 6 }, (_, i) => `${import.meta.env.BASE_URL}img/tunnel-${i + 1}.webp`);

function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

export function initTunnel() {
  const host = document.getElementById('tunnel');
  const canvas = host.querySelector('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 100);
  camera.position.set(0, 0, 3);

  const rand = rng(7);
  const loader = new THREE.TextureLoader();
  const lines = [];
  // wall frames: [origin axis builder] -> position/rotation per wall
  const walls = [
    { rot: [0, 0, 0], pos: (u, v) => [u, -HALF, v], plane: 'floor' },
    { rot: [0, 0, 0], pos: (u, v) => [u, HALF, v], plane: 'ceil' },
    { rot: [0, 0, 0], pos: (u, v) => [-HALF, u, v], plane: 'left' },
    { rot: [0, 0, 0], pos: (u, v) => [HALF, u, v], plane: 'right' },
  ];
  const unit = new THREE.PlaneGeometry(CELL, CELL);
  walls.forEach((w) => {
    for (let a = 0; a < ACROSS; a++) for (let l = 0; l < ALONG; l++) {
      const u = -HALF + CELL * (a + 0.5), z = -CELL * (l + 0.5);
      const [x, y, zz] = w.pos(u, z);
      const r = rand();
      let mat = null;
      if (l > 2 && r > 0.8) {
        mat = new THREE.MeshBasicMaterial({ color: PALETTE[Math.floor(rand() * PALETTE.length)] });
        loader.load(IMGS[Math.floor(rand() * IMGS.length)], (t) => {
          t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(9 / 16, 1); t.offset.set(7 / 32, 0);
          mat.map = t; mat.color.set(0xffffff); mat.needsUpdate = true;
        }, undefined, () => {});                         // missing image keeps the flat colour
      } else if (r > 0.55 && r <= 0.8) {
        mat = new THREE.MeshBasicMaterial({ color: PALETTE[Math.floor(rand() * PALETTE.length)] });
      }
      const m = mat && new THREE.Mesh(unit, mat);
      if (m) {
        m.position.set(x, y, zz);
        if (w.plane === 'floor') m.rotation.x = -Math.PI / 2;
        if (w.plane === 'ceil') m.rotation.x = Math.PI / 2;
        if (w.plane === 'left') m.rotation.y = Math.PI / 2;
        if (w.plane === 'right') m.rotation.y = -Math.PI / 2;
        scene.add(m);
      }
      // cell edge lines along z and across
      const h = CELL / 2, p = new THREE.Vector3(x, y, zz);
      const along = w.plane === 'floor' || w.plane === 'ceil';
      const pts = along
        ? [[-h, 0, -h], [h, 0, -h], [-h, 0, h], [h, 0, h], [-h, 0, -h], [-h, 0, h], [h, 0, -h], [h, 0, h]]
        : [[0, -h, -h], [0, h, -h], [0, -h, h], [0, h, h], [0, -h, -h], [0, -h, h], [0, h, -h], [0, h, h]];
      pts.forEach((q) => lines.push(p.x + q[0], p.y + q[1], p.z + q[2]));
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
  scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x000000 })));

  // end wall: a framed square
  const end = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, HALF * 2), new THREE.MeshBasicMaterial({ color: 0xf4e9e1 }));
  end.position.z = -DEPTH; scene.add(end);

  const state = { z: 3, mx: 0, my: 0 };
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host); resize();

  let visible = false;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(host);
  host.addEventListener('pointermove', (e) => {
    const r = host.getBoundingClientRect();
    state.mx = ((e.clientX - r.left) / r.width - 0.5) * 2; state.my = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  gsap.ticker.add(() => {
    if (!visible) return;
    camera.position.z = state.z;
    camera.rotation.y += (-state.mx * 0.06 - camera.rotation.y) * 0.06;
    camera.rotation.x += (-state.my * 0.06 - camera.rotation.x) * 0.06;
    renderer.render(scene, camera);
  });

  const btn = document.getElementById('start');
  btn.onclick = () => {
    host.classList.add('running');
    gsap.to(state, { z: -50, duration: reduced ? 0.01 : 9, ease: 'power2.inOut',
      onComplete: () => gsap.delayedCall(1.5, () => { gsap.to(state, { z: 3, duration: reduced ? 0.01 : 2.5, ease: 'power3.inOut' });
        host.classList.remove('running'); }) });
  };
}
