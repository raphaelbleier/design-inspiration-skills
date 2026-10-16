/**
 * Low-poly courier built from primitives (the original's is a skinned Draco mesh).
 * Feet at y=0, ~2 units tall, faces local +Z. Four recolourable slots drive the outfit editor:
 * hair, top, skirt, shoes. Legs/arms are pivot groups so a sine swing reads as a walk cycle.
 * Shares the toon gradient with the planet so the ink pass treats it identically.
 */
import * as THREE from 'three';

export const OUTFITS = {
  hair: ['#3b3340', '#7a4a32', '#d9b45a', '#c25959', '#4f755a'],
  top: ['#f1f0e6', '#f3c258', '#8cc48c', '#66BDE6', '#c25959'],
  skirt: ['#3f6f78', '#4f4a63', '#7d5f5a', '#6b8a5a', '#2f3a40'],
  shoes: ['#2f3032', '#c25959', '#f1f0e6', '#de794e', '#4f755a'],
};

export function makeCharacter(toon, pick = { hair: 0, top: 0, skirt: 0, shoes: 0 }) {
  const M = (hex) => new THREE.MeshToonMaterial({ color: hex, gradientMap: toon });
  const mats = { hair: M('#fff'), top: M('#fff'), skirt: M('#fff'), shoes: M('#fff'), skin: M('#e9c7b3'), sock: M('#f1f0e6'), dark: M('#2a2d31'), bag: M('#4b5252'), tie: M('#c25959') };
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo.index ? geo.toNonIndexed() : geo, mat); o.geometry.computeVertexNormals(); o.position.set(x, y, z); return o; };
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);

  const leg = (x) => {
    const g = new THREE.Group(); g.position.set(x, 0.62, 0);
    g.add(mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.5, 6), mats.skin, 0, -0.25, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 6), mats.sock, 0, -0.5, 0));
    g.add(mesh(new THREE.BoxGeometry(0.2, 0.14, 0.34), mats.shoes, 0, -0.56, 0.05));
    body.add(g); return g;
  };
  const legL = leg(0.12), legR = leg(-0.12);
  body.add(mesh(new THREE.CylinderGeometry(0.27, 0.34, 0.55, 8), mats.skirt, 0, 0.85, 0));
  body.add(mesh(new THREE.CylinderGeometry(0.22, 0.27, 0.6, 8), mats.top, 0, 1.4, 0));
  const arm = (x) => {
    const g = new THREE.Group(); g.position.set(x, 1.62, 0);
    g.add(mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.55, 6), mats.top, 0, -0.27, 0));
    g.add(mesh(new THREE.IcosahedronGeometry(0.075, 0), mats.skin, 0, -0.58, 0));
    body.add(g); return g;
  };
  const armL = arm(0.32), armR = arm(-0.32);
  const head = new THREE.Group(); head.position.set(0, 1.95, 0); body.add(head);
  head.add(mesh(new THREE.IcosahedronGeometry(0.25, 1), mats.skin));
  head.add(mesh(new THREE.IcosahedronGeometry(0.275, 1), mats.hair, 0, 0.04, -0.05));
  head.add(mesh(new THREE.BoxGeometry(0.4, 0.1, 0.1), mats.hair, 0, 0.14, 0.2));
  head.add(mesh(new THREE.IcosahedronGeometry(0.12, 0), mats.hair, 0, 0.34, -0.06));
  head.add(mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 6), mats.tie, 0, 0.27, -0.06));
  [-0.09, 0.09].forEach((x) => head.add(mesh(new THREE.BoxGeometry(0.04, 0.05, 0.03), mats.dark, x, 0.0, 0.245)));
  body.add(mesh(new THREE.BoxGeometry(0.34, 0.3, 0.12), mats.bag, 0.3, 1.0, 0));
  const strap = mesh(new THREE.BoxGeometry(0.06, 0.85, 0.46), mats.bag, 0, 1.4, 0); strap.rotation.z = -0.5; body.add(strap);

  const api = {
    group: root, head,
    setPick(p) { Object.assign(pick, p); ['hair', 'top', 'skirt', 'shoes'].forEach((k) => mats[k].color.set(OUTFITS[k][pick[k] % OUTFITS[k].length])); },
    pick,
    /** speed 0..1.3, t seconds, air = in the air */
    animate(t, speed, air) {
      const s = Math.sin(t * 10) * 0.7 * Math.min(speed, 1);
      legL.rotation.x = air ? 0.5 : s; legR.rotation.x = air ? -0.3 : -s;
      armL.rotation.x = air ? -2.2 : -s * 0.8; armR.rotation.x = air ? -2.2 : s * 0.8;
      body.position.y = air ? 0 : Math.abs(Math.sin(t * 10)) * 0.07 * Math.min(speed, 1);
    },
  };
  api.setPick({});
  return api;
}
