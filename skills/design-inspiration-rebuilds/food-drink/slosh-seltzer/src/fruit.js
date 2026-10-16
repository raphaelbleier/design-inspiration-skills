/**
 * fruit.js - a pile of fruit falls into the bottom of the yellow section, scrubbed by scroll.
 * Technique: 18 primitive-built fruit (strawberry, blueberry, orange/lime slice, cherry), no physics engine:
 * each has a rest position inside a pyramid and a staggered window of state.fruit (0..1).
 * y = lerp(start, rest, 'bounce.out'(t)), spin = (1 - t) * 3 turns. Pile anchor = bottom centre of the stage.
 * Pile: 56% of viewport width wide, up to 46% of viewport height tall, fruit radius ~ 5.5% of min(w, h) * 1.1.
 */
import * as THREE from 'three';
import gsap from 'gsap';
import { scene, place, onRender, size } from './gl.js';
import { state } from './state.js';

const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const M = (c, r = 0.35, m = 0.05) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });

const makers = {
  strawberry() {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), M(0xe3122b, 0.3));
    b.scale.set(0.85, 1.05, 0.85); g.add(b);
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.35, 6), M(0x1f9d3a));
    leaf.position.y = 1.0; g.add(leaf);
    return g;
  },
  blueberry() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 18), M(0x2441c9, 0.25)));
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 8, 12), M(0x101a66));
    crown.position.y = 0.78; crown.rotation.x = Math.PI / 2; g.add(crown);
    return g;
  },
  cherry() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 18), M(0x7a0a1c, 0.2)));
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6), M(0x3b6b2a));
    stem.position.set(0.2, 1.0, 0); stem.rotation.z = -0.35; g.add(stem);
    return g;
  },
  slice(peel, flesh, pith) {
    return () => {
      const g = new THREE.Group();
      const disc = (r, h, c, y) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40), M(c, 0.4)); m.position.y = y; g.add(m); };
      disc(1.25, 0.3, peel, 0); disc(1.12, 0.32, pith, 0); disc(1.0, 0.34, flesh, 0);
      for (let i = 0; i < 8; i++) {                       // segment dividers
        const w = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.36, 0.05), M(pith, 0.5));
        w.rotation.y = (i / 8) * Math.PI; g.add(w);
      }
      g.rotation.x = Math.PI / 2.4;
      const o = new THREE.Group(); o.add(g); return o;
    };
  },
};
const kinds = [makers.strawberry, makers.blueberry, makers.slice(0xff7a00, 0xffa31a, 0xffe6b0), makers.cherry,
  makers.blueberry, makers.slice(0x2ea043, 0x9be15d, 0xe9f7c8), makers.strawberry];

const N = 18;
const anchor = document.getElementById('fruitAnchor');
const sec = document.getElementById('taste');
const pile = new THREE.Group(); scene.add(pile);
const items = Array.from({ length: N }, (_, i) => {
  const mesh = kinds[i % kinds.length]();
  pile.add(mesh);
  return { mesh, i, x: (rnd(i, 1) * 2 - 1), h: rnd(i, 2), spin: 1.5 + rnd(i, 3) * 3, win: (i / N) * 0.55, z: rnd(i, 4) * 200 - 100 };
});
const bounce = gsap.parseEase('bounce.out');

onRender(() => {
  const r = sec.getBoundingClientRect();
  pile.visible = r.top < size.h && r.bottom > 0;
  if (!pile.visible) return;
  place(pile, anchor);
  const unit = Math.min(size.w, size.h) * 0.055;
  const W = size.w * 0.28, Hmax = size.h * 0.46;
  for (const it of items) {
    const t = Math.min(1, Math.max(0, (state.fruit - it.win) / 0.4));
    const restX = it.x * W;
    const restY = (1 - Math.abs(it.x)) * Hmax * (0.25 + 0.75 * it.h);
    const e = bounce(t);
    it.mesh.visible = t > 0;
    it.mesh.position.set(restX * (0.4 + 0.6 * e), restY + (1 - e) * size.h * 1.15, it.z);
    it.mesh.scale.setScalar(unit * (1 + it.h * 0.45));
    it.mesh.rotation.set((1 - t) * it.spin * 3, (1 - t) * it.spin * 2, it.x + (1 - t) * it.spin);
  }
});
