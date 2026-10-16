// Iridescent glass mannequin + drifting bubbles on a transparent canvas over the CSS sky.
// Technique: MeshPhysicalMaterial { iridescence: 1, iridescenceIOR: 2.0, thicknessRange 300-900, clearcoat: 1 }
// lit by a PMREM'd RoomEnvironment. Torso is a LatheGeometry rebuilt every frame while `sex` tweens 0 -> 1
// (female -> male), so shoulders widen and hips narrow as a smooth morph. Camera pos/look are gsap-tweened proxies.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

export const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.8;
export const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
export const view = { pos: new THREE.Vector3(0, 0, 6), look: new THREE.Vector3(0, 0, 0) };

const key = new THREE.DirectionalLight(0xffd6f0, 2.2); key.position.set(3, 4, 5);
const rim = new THREE.DirectionalLight(0x9cc8ff, 2.4); rim.position.set(-4, 2, -3);
scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.5));

const glass = new THREE.MeshPhysicalMaterial({
  color: 0xbfaaf0, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08,
  iridescence: 1, iridescenceIOR: 2.0, iridescenceThicknessRange: [300, 900],
});

// radius profile per height: [y, female r, male r]
const PROFILE = [[0, .62, .58], [.5, .56, .52], [.9, .42, .5], [1.4, .5, .6], [1.9, .58, .7],
  [2.2, .7, .9], [2.38, .5, .62], [2.5, .17, .19], [2.8, .15, .17]];

function lathe(t) {
  const pts = PROFILE.map(([y, f, m]) => new THREE.Vector2(f + (m - f) * t, y));
  return new THREE.LatheGeometry(pts, 48);
}

export const body = new THREE.Group();
const torso = new THREE.Mesh(lathe(0), glass); torso.scale.z = 0.62;
const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 48, 32), glass); head.scale.set(0.88, 1.15, 0.98); head.position.y = 3.12;
const arms = [-1, 1].map((s) => {
  const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 1.3, 8, 24), glass);
  a.rotation.z = s * 0.1; body.add(a); return a;
});
body.add(torso, head);
body.position.y = -2.9;
scene.add(body);

export const state = { sex: 0, spin: 0, mx: 0, my: 0 };
export function applySex() {
  torso.geometry.dispose(); torso.geometry = lathe(state.sex);
  const sh = 0.7 + (0.9 - 0.7) * state.sex;
  arms[0].position.set(-(sh + 0.12), 1.7, 0); arms[1].position.set(sh + 0.12, 1.7, 0);
}
applySex();

// bubbles: instanced spheres rising with a sine wobble, wrapped in y
const N = 70, bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12),
  new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0, transparent: true, opacity: 0.35, iridescence: 1 }), N);
const seed = Array.from({ length: N }, () => ({ x: (Math.random() - .5) * 14, y: Math.random() * 10 - 5, z: -2 + Math.random() * 4,
  s: .03 + Math.random() * .09, v: .08 + Math.random() * .2, p: Math.random() * 6.28 }));
scene.add(bubbles);
const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3();

const frameFns = [];
export const onFrame = (fn) => frameFns.push(fn);

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  // narrow screens: pull back so the body keeps its width in frame
  camera.zoom = camera.aspect < 0.8 ? camera.aspect / 0.8 : 1;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();
addEventListener('pointermove', (e) => { state.mx = e.clientX / innerWidth - .5; state.my = e.clientY / innerHeight - .5; });

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const t = clock.getElapsedTime();
  if (!reduced) {
    body.rotation.y += ((state.mx * 0.7 + state.spin + Math.sin(t * .4) * .12) - body.rotation.y) * 0.05; // eased cursor yaw
    for (let i = 0; i < N; i++) {
      const b = seed[i], y = ((b.y + t * b.v + 5) % 10) - 5;
      p3.set(b.x + Math.sin(t * .5 + b.p) * .25, y, b.z); s3.setScalar(b.s);
      bubbles.setMatrixAt(i, m4.compose(p3, q, s3));
    }
    bubbles.instanceMatrix.needsUpdate = true;
  }
  camera.position.copy(view.pos).add(new THREE.Vector3(state.mx * -.25, state.my * -.15, 0));
  camera.lookAt(view.look);
  frameFns.forEach((fn) => fn(t));
  renderer.render(scene, camera);
});

export function project(local) {
  const v = body.localToWorld(local.clone()).project(camera);
  return { x: (v.x * .5 + .5) * innerWidth, y: (-v.y * .5 + .5) * innerHeight, front: v.z < 1 };
}
export const toWorld = (local) => body.localToWorld(local.clone());
