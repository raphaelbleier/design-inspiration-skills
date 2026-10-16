/* The character: a procedural CRT-monitor head on a ribbed turtleneck torso (no model file).
   Camera fov 30 at z 7. Studio reflections from RoomEnvironment (PMREM) give the beige plastic its clearcoat.
   Head follows the pointer (lerp .06, +-.28 rad yaw, +-.12 pitch), breathes (sin .8Hz, .02 units),
   cables sway (sin, .04 rad). react() = one nod + screen glitch pulse on every dialog step.
   Layout: desktop head sits at ~70% of the width; below 900px it shrinks and drops to the lower half. */
import * as THREE from 'three';
import gsap from 'gsap';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { screenMaterial } from './screen.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function ribTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 8;
  const x = c.getContext('2d');
  x.fillStyle = '#9a8a92'; x.fillRect(0, 0, 64, 8);
  x.fillStyle = 'rgba(70,50,60,.35)'; x.fillRect(0, 0, 3, 8);
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.repeat.set(26, 1);
  t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environmentIntensity = 0.55;
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.2, 7);
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-3, 4, 5); scene.add(key);

  const plastic = new THREE.MeshPhysicalMaterial({ color: 0x77726d, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.35 });
  const black = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.6 });
  const rig = new THREE.Group(); scene.add(rig);
  const head = new THREE.Group(); rig.add(head);

  // casing: front box + tapered back box
  head.add(new THREE.Mesh(new RoundedBoxGeometry(1.7, 1.5, 1.1, 6, 0.14), plastic));
  const back = new THREE.Mesh(new RoundedBoxGeometry(1.2, 1.05, 0.9, 5, 0.16), plastic); back.position.z = -0.85; head.add(back);
  const bezel = new THREE.Mesh(new RoundedBoxGeometry(1.46, 1.2, 0.2, 5, 0.1), black); bezel.position.set(0, 0.06, 0.5); head.add(bezel);
  // screen: plane bulged outward (convex glass)
  const sg = new THREE.PlaneGeometry(1.3, 1.02, 24, 24);
  const p = sg.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) / 0.65, y = p.getY(i) / 0.51; p.setZ(i, (1 - x * x * 0.5 - y * y * 0.5) * 0.06); }
  sg.computeVertexNormals();
  const screen = new THREE.Mesh(sg, screenMaterial); screen.position.set(0, 0.06, 0.6); head.add(screen);
  // glass sheen
  const glass = new THREE.Mesh(sg, new THREE.MeshPhysicalMaterial({ transparent: true, opacity: 0.12, roughness: 0.05, clearcoat: 1, color: 0xffffff }));
  glass.position.set(0, 0.06, 0.605); head.add(glass);
  // buttons row
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.045, 0.04, 2, 0.015), new THREE.MeshStandardMaterial({ color: i === 0 ? 0x6d8bff : 0x55524f, emissive: i === 0 ? 0x2a3fa0 : 0 }));
    b.position.set(0.18 + i * 0.12, -0.62, 0.56); head.add(b);
  }
  // headphones
  const cupGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 28);
  for (const s of [-1, 1]) {
    const cup = new THREE.Mesh(cupGeo, black); cup.rotation.z = Math.PI / 2; cup.position.set(s * 0.92, 0, -0.05); head.add(cup);
  }
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.025, 8, 40, Math.PI), black); band.position.set(0, 0.05, -0.05); band.scale.y = 0.8; head.add(band);
  // neck + torso (ribbed turtleneck)
  const ribs = new THREE.MeshStandardMaterial({ map: ribTexture(), roughness: 0.95 });
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.6, 32, 1, true), ribs); neck.position.y = -1.0; rig.add(neck);
  const torsoGeo = new THREE.CapsuleGeometry(0.62, 1.6, 12, 32); torsoGeo.rotateZ(Math.PI / 2);
  const torso = new THREE.Mesh(torsoGeo, ribs); torso.position.y = -1.85; torso.scale.set(1, 1, 0.75); rig.add(torso);
  // cables: from each ear cup, drooping over the chest
  const cables = [];
  for (let i = 0; i < 6; i++) {
    const s = i % 2 ? 1 : -1, k = i / 2 | 0;
    const pts = [[s * 0.95, -0.1, 0.05], [s * (1.1 + k * 0.06), -0.7, 0.2], [s * (0.6 + k * 0.1), -1.5, 0.55], [s * (0.25 + k * 0.2), -2.2, 0.5 - k * 0.1]].map((a) => new THREE.Vector3(...a));
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.012, 6), black);
    rig.add(m); cables.push(m);
  }

  // --- layout ---
  const layout = { x: 1.3, y: 0.55, s: 1 };
  function resize() {
    const w = innerWidth, h = innerHeight, a = w / h;
    renderer.setSize(w, h, false); camera.aspect = a; camera.updateProjectionMatrix();
    const halfW = Math.tan(THREE.MathUtils.degToRad(15)) * 7 * a;
    if (w > 900) Object.assign(layout, { x: halfW * 0.38, y: 0.45, s: Math.min(1, h / 820 + 0.15) });
    else Object.assign(layout, { x: halfW * 0.25, y: -0.75, s: Math.min(0.62, halfW * 0.5) });
    rig.position.set(layout.x, layout.y, 0); rig.scale.setScalar(layout.s);
  }
  addEventListener('resize', resize); resize();

  // --- motion ---
  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; });
  const nod = { v: 0 };
  const u = screenMaterial.uniforms;

  function react() {
    if (reduced) return;
    gsap.fromTo(nod, { v: 0.14 }, { v: 0, duration: 0.9, ease: 'elastic.out(1,.5)', overwrite: true });
    gsap.fromTo(u.uGlitch, { value: 1 }, { value: 0, duration: 0.45, ease: 'power2.out', overwrite: true });
    gsap.fromTo(u.uLevel, { value: 0.9 }, { value: 0.12, duration: 2, ease: 'power2.out', overwrite: true });
  }

  const render = (t = 0) => {
    u.uTime.value = t;
    if (!reduced) {
      head.rotation.y += (mouse.x * 0.28 - head.rotation.y) * 0.06;
      head.rotation.x += (mouse.y * 0.12 + nod.v - head.rotation.x) * 0.06;
      rig.position.y = layout.y + Math.sin(t * Math.PI * 1.6) * 0.02;
      cables.forEach((c, i) => { c.rotation.z = Math.sin(t * 1.2 + i) * 0.015; });
    }
    renderer.render(scene, camera);
  };
  gsap.ticker.add(render);
  return { react };
}
