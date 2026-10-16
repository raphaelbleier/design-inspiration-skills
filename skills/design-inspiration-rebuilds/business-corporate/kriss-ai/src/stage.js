/* 3D stage: a three-storey cutaway clinic (extruded curved slabs + rounded-box props), lumpy clouds of ten merged
   spheres, transparent canvas over a CSS mauve gradient.
   Camera: fov 30, direction (0.45, 0.24, 1), one keyframe per stage; the framing is interpolated
   with smoothstep between the two nearest keyframes. Values: dist 17 x4 -> 22.
   Left-of-centre panel => look-at x = -3.0 pushes the building to the right half. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const H = 2.4;
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
  const ball = (r, x, y, z, c, g = bld) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), col(c)); m.position.set(x, y, z); g.add(m); return m; };
  // footprint in shape space (sy = -z); front corners are rounded (rl front-left, rr front-right)
  const outline = (w, d, rl, rr) => {
    const s = new THREE.Shape(), x0 = -w / 2, x1 = w / 2, yb = -d / 2, yt = d / 2;
    s.moveTo(x0, yt); s.lineTo(x1, yt); s.lineTo(x1, yb + rr);
    s.absarc(x1 - rr, yb + rr, rr, 0, -Math.PI / 2, true);
    s.lineTo(x0 + rl, yb); s.absarc(x0 + rl, yb + rl, rl, -Math.PI / 2, -Math.PI, true); s.closePath();
    return s;
  };
  const slab = (shape, h, y, c, bevel = 0.03) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 24 });
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, col(c)); m.position.y = y; bld.add(m); return m;
  };
  const person = (x, y, z, c, sit = false) => {
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, sit ? 0.18 : 0.3, 4, 8), col(c)); b.position.set(x, y + (sit ? 0.45 : 0.3), z);
    bld.add(b); ball(0.095, x, y + (sit ? 0.78 : 0.66), z, 0xf2cdb5);
  };
  const plant = (x, y, z, s = 1) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.07 * s, 0.2 * s, 12), col(0x4a5aa8)); p.position.set(x, y + 0.1 * s, z); bld.add(p);
    ball(0.2 * s, x, y + 0.36 * s, z, 0x4f8d5d); ball(0.13 * s, x + 0.1 * s, y + 0.52 * s, z, 0x5fa06b);
  };
  const cabinet = (x, y, z, panel) => {
    box(0.62, 1.7, 0.5, x, y + 0.95, z, 0xe9e5e6, 0.05);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) box(0.2, 0.22, 0.03, x - 0.14 + c * 0.28, y + 0.35 + r * 0.3, z + 0.26, (r + c) % 2 ? panel : 0x3b3946, 0.01);
  };

  const FW = 7, FD = 3.8, RL = 1.3;
  // per floor: [room-left wall, room-left floor, room-right wall, room-right floor, cabinet panel]
  const floors = [
    [0xf2bd8f, 0xf0d2b0, 0xb3c0ee, 0x8ea6e6, 0xe58f9a],
    [0xdceee0, 0x9fd3b0, 0xcdbcf0, 0xb7a2e0, 0xe7c06d],
    [0xf5dccf, 0xe9b9a6, 0xe0e4f6, 0x9fb2ea, 0x9fb2ea],
  ];
  floors.forEach(([lw, lf, rw, rf, pn], i) => {
    const y = i * H;
    slab(outline(FW, FD, RL, 0.5), 0.2, y - 0.1, 0xe9bfae);                       // peach slab edge
    box(3.5, 0.05, FD - 0.2, -FW / 4 + 0.05, y + 0.12, 0, lf, 0.02);
    const rfl = slab(outline(FW / 2 - 0.05, FD - 0.2, 0.01, 0.5), 0.05, y + 0.1, rf, 0.01); rfl.position.x = FW / 4 + 0.03;
    box(FW / 2 - 0.05, H, 0.14, -FW / 4 + 0.03, y + H / 2, -FD / 2 + 0.07, lw);    // back wall left room
    box(FW / 2, H, 0.14, FW / 4, y + H / 2, -FD / 2 + 0.07, rw);                   // back wall right room
    box(0.14, H, FD - 0.1, FW / 2 - 0.07, y + H / 2, 0, 0xe8e4ee);                // right wall
    box(0.14, H, FD - RL, -FW / 2 + 0.07, y + H / 2, -RL / 2, 0xf3eee9);          // left wall
    const ring = new THREE.Shape(), cx = -FW / 2 + RL, cy = -FD / 2 + RL;          // curved front-left wall
    ring.absarc(cx, cy, RL, -Math.PI, -Math.PI / 2, false); ring.lineTo(cx, -FD / 2 + 0.14);
    ring.absarc(cx, cy, RL - 0.14, -Math.PI / 2, -Math.PI, true); ring.closePath();
    const rg = new THREE.ExtrudeGeometry(ring, { depth: H, bevelEnabled: false, curveSegments: 20 }); rg.rotateX(-Math.PI / 2);
    const rm = new THREE.Mesh(rg, col(0xf3eee9)); rm.position.y = y; bld.add(rm);
    box(0.12, H, FD * 0.5, 0.5, y + H / 2, -FD * 0.25 + 0.1, 0xf8f4f0);            // divider, door gap at the front
    // left room: cabinets, plant, stairs
    [-2.7, -2.0, -1.3].forEach((x) => cabinet(x, y + 0.1, -1.2, pn));
    plant(-2.9, y + 0.1, 0.5); plant(-0.4, y + 0.1, 1.2, 0.8);
    for (let k = 0; k < 4; k++) box(0.6, 0.12, 0.28, -1.7 + k * 0.28, y + 0.19 + k * 0.13, 0.3, 0xf2e6e0, 0.02);
    // right room: curved desk, screen, chair, person, window, shelves, lamp column
    box(1.9, 0.1, 0.75, 2.2, y + 0.78, -0.5, 0x7d93df, 0.05); box(1.9, 0.6, 0.12, 2.2, y + 0.5, -0.2, 0x7d93df, 0.04);
    box(0.5, 0.32, 0.04, 2.0, y + 1.02, -0.7, 0x2c2c38, 0.015); box(0.04, 0.2, 0.04, 2.0, y + 0.88, -0.7, 0xdddddd, 0.01);
    ball(0.17, 2.4, y + 0.55, 0.3, 0xe9e5e6); box(0.04, 0.4, 0.04, 2.4, y + 0.32, 0.3, 0xcccccc, 0.01);
    person(2.4, y + 0.1, 0.3, pn === 0x9fb2ea ? 0xc7b4f0 : 0x7d93df, true);
    const win = new THREE.Mesh(new THREE.CircleGeometry(0.6, 32), new THREE.MeshBasicMaterial({ color: 0xf7f3fa })); win.position.set(2.45, y + 1.5, -FD / 2 + 0.15); bld.add(win);
    [1.1, 1.45].forEach((h) => { box(0.95, 0.05, 0.25, 1.0, y + h, -FD / 2 + 0.28, 0xffffff, 0.02); box(0.14, 0.12, 0.12, 0.8, y + h + 0.09, -FD / 2 + 0.28, pn, 0.02); box(0.2, 0.08, 0.1, 1.15, y + h + 0.07, -FD / 2 + 0.28, 0xcccccc, 0.02); });
    for (let k = 0; k < 5; k++) ball(0.07, 0.7, y + 0.9 + k * 0.17, -FD / 2 + 0.3, 0xffffff);
    const lamp = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.02, 8, 24, Math.PI), col(0x333333)); lamp.position.set(-2.3, y + 0.6, 1.0); bld.add(lamp);
    plant(3.0, y + 0.1, 1.4);
  });
  person(-1.0, 0.1, 1.4, 0x6a78c9);
  person(0.1, 0.1, 0.8, 0xf0b99a);
  slab(outline(FW + 0.5, FD + 0.4, 1.6, 0.6), 0.28, 3 * H, 0xe9e3e6, 0.08).position.x = 0.1;     // curved roof slab
  box(0.2, 3 * H, 0.2, FW / 2 + 0.05, 1.5 * H, FD / 2 - 0.1, 0xe9e3e6);                       // front pillar

  // clouds: ~9 merged spheres of varied radius, light lilac, bob slowly
  const clouds = [];
  const cmat = new THREE.MeshStandardMaterial({ color: 0xdedbea, roughness: 0.9 });
  const mkCloud = (x, y, z, s) => {
    const g = new THREE.Group();
    [[0, 0, 0, 0.62], [0.7, -0.08, 0.1, 0.5], [-0.65, -0.12, 0, 0.45], [0.15, 0.42, 0.05, 0.48], [0.95, 0.28, -0.05, 0.3], [-0.35, 0.38, 0.1, 0.34],
      [0.4, -0.3, 0.25, 0.32], [-0.95, 0.1, -0.1, 0.26], [1.25, -0.12, 0, 0.26], [1.85, -0.2, 0, 0.1]].forEach(([a, b, c, r]) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), cmat); m.position.set(a, b, c); g.add(m);
    });
    g.position.set(x, y, z); g.scale.setScalar(s * 0.72); g.userData = { y, ph: Math.random() * 6 };
    scene.add(g); clouds.push(g);
  };
  mkCloud(-3.6, 12.4, 0, 1.0); mkCloud(-7.6, 10.4, 0, 0.8); mkCloud(4.8, 10.2, 0, 1.0); mkCloud(2.0, 15.4, 0, 1.1);
  mkCloud(-9.5, 6.5, 0, 0.9); mkCloud(8, 7.5, 0, 1.0); mkCloud(-10.5, 1.5, 0, 0.9); mkCloud(8, 2.5, 0, 0.9); mkCloud(7, 13, -3, 1.2);

  // camera keyframes: [lookX, lookY, dist]  (desktop / portrait)
  const KD = [[0, 9.9, 17], [-3.0, 6.6, 17], [-3.0, 4.1, 17], [-3.0, 1.7, 17], [-3.0, 4.0, 22]];
  const KP = [[0, 11.0, 27], [0, 6.0, 26], [0, 3.6, 26], [0, 1.2, 26], [0, 3.4, 36]];
  const dir = new THREE.Vector3(0.45, 0.24, 1).normalize();
  const ease = (x) => x * x * (3 - 2 * x);
  const look = new THREE.Vector3();

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);

  // hotspots (world points), projected to screen each frame
  const spots = [[0, 7.7, 1.5], [2.3, 5.9, 0.3], [2.3, 3.5, 0.3], [1.0, 1.1, 1.2], [3.0, 0.5, 1.4]]
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
