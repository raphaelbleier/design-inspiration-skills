/**
 * can.js - the 3D can (Three.js, one fixed full-viewport canvas, transparent).
 * Technique: LatheGeometry body, procedural canvas label texture per flavor, RoomEnvironment for
 * metal reflections, a separate pull-tab mesh that lifts. Pose is scrubbed with GSAP ScrollTrigger:
 *   hero -> circle section: y 0 -> -2.4, scale 1.3 -> 1.25, rotation.x 0 -> .75 (top toward camera),
 *   tab lifts 0 -> 1.15 rad, one full z spin on the way. Mouse tilt: +-.22 rad lerped at .08.
 * Flavor switch: one full Y turn in .9s power3.inOut, texture swapped at the half turn.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced, onFrame } from './scroll.js';

export const FLAVORS = [
  { name: 'Peach & Basil', bg: '#acd084', can: '#7fbf57', dark: '#195e1c', btn: 'green' },
  { name: 'Orange Zest', bg: '#ffd372', can: '#fab92f', dark: '#f15b40', btn: 'coral' },
  { name: 'Plum & Rose', bg: '#88c1f8', can: '#4d7ed8', dark: '#2b3d73', btn: 'blue' },
  { name: 'Berry Punch', bg: '#f6b1cf', can: '#ff7fb7', dark: '#e72f63', btn: 'red' },
];

const pose = { x: 0, y: 0, s: 1.3, tab: 0, z: 0, spin: 0, mx: 0, my: 0 };
let can, tab, mats = [], textures = [], renderer, scene, camera, canvasEl;

function label(f) {
  const w = 1536, h = 1024;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = f.can; g.fillRect(0, 0, w, h);
  g.fillStyle = f.dark; g.fillRect(0, 0, w, 110);              // neck band
  g.fillStyle = 'rgba(255,255,255,.9)';
  g.font = '500 44px "Inter Tight Variable", sans-serif'; g.textAlign = 'center';
  g.fillText('ORGANIC ENERGY INFUSION  *  ORGANIC ENERGY INFUSION  *', w / 2, 72);
  // soft pattern blobs so the label is not flat
  g.fillStyle = 'rgba(255,255,255,.18)';
  [[220, 380, 120], [1300, 620, 150], [520, 760, 70], [1040, 300, 90]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
  g.fillStyle = f.dark;
  [[150, 700, 60], [1380, 330, 50]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
  // big white vertical wordmark on the front (u = .5)
  g.save(); g.translate(w / 2, 520); g.rotate(-Math.PI / 2);
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '800 330px "Inter Tight Variable", sans-serif';
  g.fillText('KIKO', 0, 0, 620);
  g.restore();
  g.fillStyle = '#fff'; g.font = '500 54px "Inter Tight Variable", sans-serif'; g.textAlign = 'center';
  g.fillText(f.name.toUpperCase(), w / 2 - 330, 940);
  g.font = '400 40px "Inter Tight Variable", sans-serif'; g.fillText('355 ml', w / 2 + 330, 940);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function build() {
  const pts = [];
  const N = 90;
  for (let i = 0; i <= N; i++) {
    const y = -1.15 + (2.3 * i) / N;
    const ay = Math.abs(y);
    let r = 0.55;
    if (ay > 1.0) r = 0.55 - Math.pow((ay - 1.0) / 0.15, 2) * 0.1;   // rounded shoulders
    pts.push(new THREE.Vector2(r, y));
  }
  const geo = new THREE.LatheGeometry(pts, 96, -Math.PI, Math.PI * 2);
  const body = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: textures[0], metalness: 0.45, roughness: 0.38 }));
  mats.push(body.material);
  const metal = new THREE.MeshStandardMaterial({ color: 0x8f8f8f, metalness: 1, roughness: 0.32 });
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.46, 0.06, 64), metal);
  lid.position.y = 1.16;
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.02, 64), metal);
  dish.position.y = 1.2;
  const shape = new THREE.Shape();
  shape.absellipse(0, 0.2, 0.13, 0.19, 0, Math.PI * 2);
  const hole = new THREE.Path(); hole.absellipse(0, 0.25, 0.07, 0.11, 0, Math.PI * 2); shape.holes.push(hole);
  tab = new THREE.Group();
  const tabMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: false }), metal);
  tabMesh.rotation.x = -Math.PI / 2; tabMesh.position.set(0, 0.012, -0.0);
  tab.add(tabMesh); tab.position.set(0, 1.215, -0.12);
  can = new THREE.Group(); can.add(body, lid, dish, tab);
  scene.add(can);
}

export async function initCan(hero) {
  canvasEl = document.getElementById('can-canvas');
  if (reduced) hero.appendChild(canvasEl);
  await document.fonts.load('800 100px "Inter Tight Variable"').catch(() => {});
  renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50); camera.position.z = 9;
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(2, 3, 5); scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  textures = FLAVORS.map(label);
  build();

  const resize = () => {
    const w = canvasEl.clientWidth || innerWidth, h = canvasEl.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // keep the can the same fraction of the screen height; narrower screens fit by width
    pose.base = w / h < 0.9 ? 0.78 : 1;
    camera.updateProjectionMatrix();
  };
  resize(); addEventListener('resize', resize);

  window.addEventListener('pointermove', (e) => {
    pose.mx = (e.clientX / innerWidth - 0.5) * 2; pose.my = (e.clientY / innerHeight - 0.5) * 2;
  });
  let tx = 0, ty = 0;
  onFrame(() => {
    tx += (pose.mx - tx) * 0.08; ty += (pose.my - ty) * 0.08;
    const k = pose.base || 1;
    can.scale.setScalar(pose.s * k);
    can.position.set(0, pose.y, 0);
    can.rotation.set(pose.x + ty * 0.22, pose.spin + tx * 0.22, pose.z, 'YXZ');
    tab.rotation.x = -pose.tab;
    renderer.render(scene, camera);
  });

  if (!reduced) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 },
    });
    tl.to(pose, { z: -1.1, y: -1.2, duration: 1, ease: 'power1.inOut' })
      .to(pose, { z: 0, y: -2.4, x: 0.75, s: 1.25, tab: 1.15, duration: 1, ease: 'power1.inOut' });
    // leave: slide the can down once the ring is finished, the next section covers the canvas
    gsap.to(pose, { y: -5, ease: 'none', scrollTrigger: { trigger: '#circle', start: 'bottom bottom', end: '+=60%', scrub: true,
      endTrigger: '#circle' } });
  }
}

let current = 0, busy = false;
export function switchFlavor(i, onMid) {
  if (busy || i === current) return;
  busy = true; current = i;
  const half = { done: false };
  gsap.to(pose, {
    spin: '+=' + Math.PI * 2, duration: 0.9, ease: 'power3.inOut', onComplete: () => { busy = false; pose.spin = 0; },
    onUpdate() { if (!half.done && this.progress() > 0.5) { half.done = true; mats[0].map = textures[i]; mats[0].needsUpdate = true; onMid?.(); } },
  });
}
