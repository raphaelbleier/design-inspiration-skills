/* WebGL scene: 18 procedural cans (6 flavours x 3 loops) on a slab, driven every frame by `data`.
 * Can = LatheGeometry aluminium body (metalness .92, roughness .28, RoomEnvironment reflections)
 * + open cylinder label (r .503) textured from a canvas: optional webp art, brand mark on top.
 * Camera PerspectiveCamera(near .1, far 100); position / rotation / fov come from the timeline.
 * Placement of can i: k = wrap(i - carousel.pos, -9, 9); line x = k * spacing;
 * helix (swirl 1): a = k * .75, (sin a * 3.4, k * .3, cos a * 3.4 - 3.4); blended with swirl.
 * Wave: y += sin(k * .9 + t * 1.6) * .35 * wave. Light: tinted PointLight in the flavour colour. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { data } from './timeline.js';
import { carousel, wrap } from './carousel.js';
import { FLAVORS } from './flavors.js';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const LOOPS = 3, N = FLAVORS.length * LOOPS;
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 1024 ? 2 : 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.rotation.order = 'YXZ';

const spot = new THREE.SpotLight(0xffffff, 0, 14, Math.PI / 5, 1, 0.6);
spot.position.set(0, 5, 4);
scene.add(spot, spot.target);
export const tintLight = new THREE.PointLight(FLAVORS[0].s, 0, 14, 1.2);
tintLight.position.set(0, 1, 3);
scene.add(tintLight);

/* ---- can ---- */
const profile = [[0, -1.12], [0.3, -1.14], [0.38, -1.2], [0.44, -1.2], [0.5, -1.1], [0.5, 0.85], [0.47, 0.98], [0.41, 1.08],
  [0.37, 1.14], [0.38, 1.2], [0.34, 1.2], [0.32, 1.16], [0, 1.16]].map(([x, y]) => new THREE.Vector2(x, y));
const bodyGeo = new THREE.LatheGeometry(profile, 64);
const labelGeo = new THREE.CylinderGeometry(0.503, 0.503, 1.9, 64, 1, true);
labelGeo.translate(0, -0.12, 0);
labelGeo.rotateY(-Math.PI / 2);   // seam to the side: art centres at u .25 / .75 face front / back
const metal = new THREE.MeshStandardMaterial({ color: 0xd8dade, metalness: 0.92, roughness: 0.28, side: THREE.DoubleSide });

function labelTexture(f) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d'); const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const img = new Image();
  const draw = (withImg) => {
    const grad = g.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, f.p); grad.addColorStop(0.5, f.s); grad.addColorStop(1, f.p);
    g.fillStyle = grad; g.fillRect(0, 0, 1024, 512);
    if (withImg) g.drawImage(img, 0, 0, 1024, 512);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '500 150px "Libre Franklin", Arial'; g.fillText('BRIO', 256, 230);
    g.font = '500 46px "Libre Franklin", Arial'; g.fillText(f.name.toUpperCase(), 256, 340);
    g.fillText('BRIO', 768, 230); g.font = '500 46px "Libre Franklin", Arial'; g.fillText(f.name.toUpperCase(), 768, 340);
    tex.needsUpdate = true;
  };
  draw(false);
  img.onload = () => draw(true);
  img.src = `./img/label-${f.key}.webp`;
  document.fonts?.ready.then(() => draw(img.complete && img.naturalWidth > 0));
  return tex;
}
const labels = FLAVORS.map((f) => new THREE.MeshStandardMaterial({ map: labelTexture(f), metalness: 0.45, roughness: 0.35, side: THREE.DoubleSide }));

const cans = Array.from({ length: N }, (_, i) => {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(bodyGeo, metal), new THREE.Mesh(labelGeo, labels[i % FLAVORS.length]));
  scene.add(g);
  return g;
});

const base = new THREE.Mesh(new THREE.BoxGeometry(60, 0.3, 3), new THREE.MeshStandardMaterial({ color: 0x0a0710, metalness: 0.2, roughness: 0.6, envMapIntensity: 0.08 }));
scene.add(base);

/* ---- frame ---- */
const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener('pointermove', (e) => { mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1; });

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
}
addEventListener('resize', resize);
resize();

export function renderScene(dt, t) {
  const d = data, narrow = camera.aspect < 1;
  mouse.sx += (mouse.x - mouse.sx) * 0.06; mouse.sy += (mouse.y - mouse.sy) * 0.06;
  camera.position.set(d.camX, d.camY, d.camZ);
  camera.rotation.set(d.camRX, d.camRY, d.camRZ);
  camera.fov = d.fov * (narrow ? 1.55 : 1);               // keep the row readable in portrait
  camera.updateProjectionMatrix();
  scene.environmentIntensity = d.env;
  spot.intensity = d.spot; spot.position.set(d.camX * 0.5, 5, 4);
  tintLight.intensity = d.tint * 18;

  for (let i = 0; i < N; i++) {
    const k = wrap(i - carousel.pos + N / 2, N) - N / 2;
    const a = k * 0.75, s = d.swirl;
    const x = k * d.spacing * (1 - s) + Math.sin(a) * 3.4 * s;
    let y = k * 0.3 * s + Math.sin(k * 0.9 + t * 1.6) * 0.35 * d.wave;
    const z = (Math.cos(a) * 3.4 - 3.4) * s;
    if (!REDUCED) y += Math.sin(t * 0.8 + i) * 0.03;
    const near = Math.max(0, 1 - Math.abs(k));              // only the centre can follows the pointer
    const c = cans[i];
    c.position.set(x + d.canX * Math.min(1, camera.aspect), y + d.canY, z + d.canZ);
    c.rotation.set(d.canRX + mouse.sy * d.pointer * near, d.canRY + d.spin + mouse.sx * d.pointer * near, d.canRZ);
    c.scale.setScalar(d.canScale);
  }
  base.position.set(0, -1.35 - d.baseOffset, 0);
  canvas.style.opacity = d.fade;
  document.querySelector('.bg').style.opacity = d.fade;
  if (d.fade > 0.001) renderer.render(scene, camera);
}
