/**
 * can.js - procedural aluminium can, used twice:
 *  1. hero: seen from above (axis towards the camera), click -> tab lifts, opening appears,
 *     can spins one turn (.9s power3.out) and `state.pop` goes 0 -> 1 for the foam.
 *  2. bands: lying across four coloured bands, spins with scroll and swaps flavour at 25/50/75%.
 * Body: CylinderGeometry side, MeshStandardMaterial metalness .55 roughness .32 + a CanvasTexture label.
 * Lid: silver cylinder + rim torus + extruded tab (Shape with a hole). Radius comes from the anchor size.
 */
import * as THREE from 'three';
import gsap from 'gsap';
import { scene, place, onRender } from './gl.js';
import { state, reduced } from './state.js';

const silver = new THREE.MeshStandardMaterial({ color: 0x80878f, metalness: 1, roughness: 0.34 });
const dark = new THREE.MeshStandardMaterial({ color: 0x15171a, metalness: 0.4, roughness: 0.6 });

export const FLAVORS = [
  { bg: '#FF5F00', fg: '#FFC800', dot: '#FFC800' },
  { bg: '#00A165', fg: '#FFC1FF', dot: '#FFFFFF' },
  { bg: '#FFC1FF', fg: '#FF0837', dot: '#FF0837' },
  { bg: '#ECE4D5', fg: '#0069D8', dot: '#0069D8' },
];

function labelTexture({ bg, fg, dot }) {
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 1024, 1024);
  g.fillStyle = dot;
  for (let i = 0; i < 46; i++) {                                   // seeded scatter of dots
    const x = (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1, y = (Math.sin(i * 78.233) * 12345.678 % 1 + 1) % 1;
    g.globalAlpha = 0.5; g.beginPath(); g.arc(x * 1024, y * 1024, 5 + (i % 4) * 3, 0, 7); g.fill();
  }
  g.globalAlpha = 1; g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const [u, txt, px] of [[256, 'FIZZO', 300], [768, 'FIZZO', 300], [512, 'SPRITZ', 120]]) {
    g.save(); g.translate(u, 512); g.rotate(Math.PI / 2);
    g.font = `${px}px "League Gothic", Impact, sans-serif`; g.fillText(txt, 0, 0); g.restore();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export function makeCan(flavor = FLAVORS[1]) {
  const R = 1, H = 2.3;
  const root = new THREE.Group();       // positioned + scaled + oriented by the caller
  const spin = new THREE.Group();       // rotates about the can axis (Y)
  root.add(spin);
  const bodyMat = new THREE.MeshStandardMaterial({ map: labelTexture(flavor), metalness: 0.55, roughness: 0.32 });
  spin.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.96, H, 64, 1, true), bodyMat));
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.96, R * 0.96, 0.02, 48), silver);
  bottom.position.y = -H / 2; spin.add(bottom);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.9, R * 0.97, 0.08, 64), silver);
  lid.position.y = H / 2 + 0.02; spin.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R * 0.93, 0.055, 16, 64), silver);
  rim.rotation.x = Math.PI / 2; rim.position.y = H / 2 + 0.04; spin.add(rim);
  const score = new THREE.Mesh(new THREE.TorusGeometry(R * 0.72, 0.012, 8, 64), dark);
  score.rotation.x = Math.PI / 2; score.position.y = H / 2 + 0.066; spin.add(score);

  const topY = H / 2 + 0.07;
  const opening = new THREE.Mesh(new THREE.CircleGeometry(1, 32), dark);
  opening.rotation.x = -Math.PI / 2; opening.scale.set(0.2, 0.34, 1); opening.position.set(0, topY + 0.004, 0.34); opening.visible = false;
  spin.add(opening);

  const s = new THREE.Shape();                                       // tab outline (x width, y length)
  const w = 0.3, l = 0.92;
  s.moveTo(-w, 0); s.lineTo(-w, l - w); s.absarc(0, l - w, w, Math.PI, 0, true); s.lineTo(w, 0); s.lineTo(-w, 0);
  const hole = new THREE.Path(); hole.absellipse(0, l - w - 0.02, 0.16, 0.2, 0, Math.PI * 2, false); s.holes.push(hole);
  const tabGeo = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: false });
  const tab = new THREE.Mesh(tabGeo, silver);
  tab.rotation.x = Math.PI / 2;                                      // lie flat on the lid (shape y -> +z)
  tab.position.set(0, 0.035, -0.35);
  const hinge = new THREE.Group(); hinge.position.set(0, topY, -0.02); hinge.add(tab); spin.add(hinge);

  const setFlavor = (f) => { bodyMat.map.dispose(); bodyMat.map = labelTexture(f); bodyMat.needsUpdate = true; };
  return { root, spin, hinge, opening, setFlavor };
}

/* ---------- hero can ---------- */
const heroEl = document.getElementById('canHero');
export const hero = makeCan(FLAVORS[1]);
hero.root.rotation.x = Math.PI / 2;           // axis (Y) -> towards camera
const heroTilt = new THREE.Group(); heroTilt.add(hero.root); scene.add(heroTilt);
let heroIn = 0;                                // 0..1 intro scale

export function introHeroCan() {
  gsap.to({ v: 0 }, { v: 1, duration: 1.1, ease: 'back.out(1.6)', onUpdate() { heroIn = this.targets()[0].v; } });
  if (reduced) heroIn = 1;
}

export function popCan() {
  if (state.pop) return;
  if (reduced) { hero.hinge.rotation.x = -0.6; hero.opening.visible = true; state.pop = 1; return; }
  gsap.timeline()
    .to(hero.hinge.rotation, { x: -0.9, duration: 0.25, ease: 'power2.out' })
    .add(() => { hero.opening.visible = true; }, 0.1)
    .to(hero.spin.rotation, { y: -Math.PI * 2, duration: 0.9, ease: 'power3.out' }, 0)
    .to(state, { pop: 1, duration: 0.01 }, 0.18);
}

/* ---------- band can ---------- */
const bandEl = document.getElementById('canBand');
const bandSec = document.getElementById('bands');
export const band = makeCan(FLAVORS[0]);
band.root.rotation.z = Math.PI / 2; band.root.rotation.x = 0.35;     // lie along x, tipped towards the viewer
const bandGroup = new THREE.Group(); bandGroup.add(band.root); scene.add(bandGroup);
let bandIdx = 0, bandPop = 1;

onRender(() => {
  const heroR = heroEl.getBoundingClientRect();
  heroTilt.visible = heroIn > 0 && heroR.bottom > -50;
  if (heroTilt.visible) {
    place(heroTilt, heroEl);
    const r = heroR.width / 2 / 1.02;
    heroTilt.scale.setScalar(r * heroIn);
    heroTilt.rotation.x = -state.my * 0.12; heroTilt.rotation.y = state.mx * 0.12;
  }
  const sr = bandSec.getBoundingClientRect();
  bandGroup.visible = sr.top < innerHeight && sr.bottom > 0;
  if (bandGroup.visible) {
    place(bandGroup, bandEl);
    bandGroup.scale.setScalar(bandEl.getBoundingClientRect().width / 2 / 1.25 * (0.8 + 0.2 * bandPop));
    band.spin.rotation.y = state.bands * Math.PI * 10;
    const idx = Math.min(3, Math.floor(state.bands * 4));
    if (idx !== bandIdx) { bandIdx = idx; band.setFlavor(FLAVORS[idx]); bandPop = 0; gsap.to({ v: 0 }, { v: 1, duration: 0.6, ease: 'back.out(2)', onUpdate() { bandPop = this.targets()[0].v; } }); }
  }
});
