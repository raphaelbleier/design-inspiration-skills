/* 3D stage: a three-storey cutaway clinic built from rounded boxes, soft clouds made of merged
   spheres, transparent canvas over a CSS mauve gradient.
   Camera: fov 30, direction (0.5, 0.12, 1), one keyframe per stage; the framing is interpolated
   with smoothstep between the two nearest keyframes. Values: dist 16 -> 14.5 x3 -> 19.
   Left-of-centre panel => look-at x = -1.3 pushes the building to the right half. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const H = 2.4, W = 6.4, D = 4;
const col = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 });

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcdb8c4, 1.7));
  const sun = new THREE.DirectionalLight(0xfff3ea, 2.2); sun.position.set(6, 10, 8); scene.add(sun);

  const bld = new THREE.Group(); scene.add(bld);
  const box = (w, h, d, x, y, z, c, r = 0.04, g = bld) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), col(c));
    m.position.set(x, y, z); g.add(m); return m;
  };
  const person = (x, y, z, c) => {
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.3, 4, 8), col(c)); b.position.set(x, y + 0.3, z);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), col(0xf2cdb5)); h.position.set(x, y + 0.66, z);
    bld.add(b, h);
  };
  const plant = (x, y, z) => {
    box(0.16, 0.2, 0.16, x, y + 0.1, z, 0x4a5aa8);
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), col(0x4f8d5d)); s.position.set(x, y + 0.38, z); bld.add(s);
  };

  // floor palettes: [floor, backWall, accent]
  const floors = [[0xb9a6e0, 0xe6dff2, 0x9fd3b0], [0xf2bb9b, 0xf5e4da, 0xc7b4f0], [0x8fa7e6, 0xe4e8f6, 0xf0b99a]];
  floors.forEach(([fl, back, acc], i) => {
    const y = i * H;
    box(W, 0.2, D, 0, y, 0, fl, 0.06);                          // slab
    box(W, H, 0.16, 0, y + H / 2, -D / 2 + 0.08, back);         // back wall
    box(0.16, H, D, -W / 2 + 0.08, y + H / 2, 0, 0xf3eee9);     // left wall
    box(0.16, H, D, W / 2 - 0.08, y + H / 2, 0, 0xf3eee9);      // right wall
    box(0.12, H, D * 0.55, 0.5, y + H / 2, -D * 0.22, 0xf8f4f0); // divider (door gap at front)
    // left room: cabinets + plant
    [-2.5, -1.9, -1.3].forEach((x, k) => box(0.5, 1.3, 0.5, x, y + 0.85, -1.4, k === 1 ? 0xd9d2dc : acc));
    plant(-2.8, y + 0.1, 0.6);
    // right room: desk, screen, chair, person
    box(1.7, 0.1, 0.7, 2.0, y + 0.75, -0.6, 0xfaf6f2); box(0.1, 0.65, 0.5, 1.3, y + 0.43, -0.6, 0xe0d8dc);
    box(0.5, 0.32, 0.05, 2.0, y + 1.0, -0.8, 0x2c2c38, 0.02);
    person(1.7, y + 0.1, 0.1, acc);
    // round window on the back wall
    const w = new THREE.Mesh(new THREE.CircleGeometry(0.55, 28), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    w.position.set(2.4, y + 1.5, -D / 2 + 0.17); bld.add(w);
    // wall shelves
    box(0.9, 0.05, 0.25, 0.9, y + 1.45, -D / 2 + 0.3, 0xffffff); box(0.9, 0.05, 0.25, 0.9, y + 1.1, -D / 2 + 0.3, 0xffffff);
  });
  person(-1.3, 0.1, 0.6, 0x6a78c9);
  box(W + 0.4, 0.4, D + 0.3, 0, 3 * H + 0.1, 0.1, 0xf1ecec, 0.18);   // roof slab
  box(0.2, 3 * H, 0.2, W / 2 - 0.1, 1.5 * H, D / 2 - 0.1, 0xe9e3e6); // front pillar
  bld.position.y = 0;

  // clouds: merged spheres, light lilac, bob slowly
  const clouds = [];
  const mkCloud = (x, y, z, s) => {
    const g = new THREE.Group();
    [[0, 0, 0, 0.7], [0.75, -0.1, 0.1, 0.55], [-0.7, -0.15, 0, 0.5], [0.2, 0.45, 0, 0.5], [1.3, -0.3, 0, 0.22]].forEach(([a, b, c, r]) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 20), new THREE.MeshStandardMaterial({ color: 0xe6e2ec, roughness: 0.9 }));
      m.position.set(a, b, c); g.add(m);
    });
    g.position.set(x, y, z); g.scale.setScalar(s); g.userData = { y, ph: Math.random() * 6 };
    scene.add(g); clouds.push(g);
  };
  mkCloud(-5, 9, 1, 1.1); mkCloud(4.5, 7.5, 2, 1); mkCloud(-6, 4.5, 3, 0.9); mkCloud(6.5, 2.2, 2, 1.1);
  mkCloud(-5.5, -0.5, 2, 1); mkCloud(5, 11, -2, 1.2); mkCloud(-3, 12.5, -3, 0.9);

  // camera keyframes: [lookX, lookY, dist]  (desktop / portrait)
  const KD = [[0, 9.5, 16], [-1.3, 5.9, 14.5], [-1.3, 3.5, 14.5], [-1.3, 1.2, 14.5], [-2.8, 3.8, 19]];
  const KP = [[0, 12.5, 30], [0, 6.0, 24], [0, 3.6, 24], [0, 1.2, 24], [0, 3.4, 34]];
  const dir = new THREE.Vector3(0.5, 0.12, 1).normalize();
  const ease = (x) => x * x * (3 - 2 * x);
  const look = new THREE.Vector3();

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);

  // hotspots (world points), projected to screen each frame
  const spots = [[0, 7.6, 1.5], [1.7, 5.9, 1.2], [1.7, 3.5, 1.2], [1.0, 1.1, 1.2], [2.9, 0.5, 2.2]]
    .map((p) => new THREE.Vector3(...p));

  function render(t, time) {
    const k = innerWidth / innerHeight < 0.9 ? KP : KD;
    const i = Math.min(Math.floor(t), k.length - 2), f = ease(Math.min(1, Math.max(0, t - i)));
    const a = k[i], b = k[i + 1];
    const lx = a[0] + (b[0] - a[0]) * f, ly = a[1] + (b[1] - a[1]) * f, dist = a[2] + (b[2] - a[2]) * f;
    look.set(lx, ly, 0);
    camera.position.copy(look).addScaledVector(dir, dist);
    camera.lookAt(look);
    if (!reduce) clouds.forEach((c) => { c.position.y = c.userData.y + Math.sin(time * 0.6 + c.userData.ph) * 0.18; });
    renderer.render(scene, camera);
    return spots.map((p) => { const v = p.clone().project(camera); return [(v.x * 0.5 + 0.5) * innerWidth, (-v.y * 0.5 + 0.5) * innerHeight]; });
  }
  return { render };
}
