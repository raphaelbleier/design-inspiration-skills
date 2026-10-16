/* The hero object: a procedural cork coaster (Three.js, transparent canvas over the page).
   Technique: LatheGeometry profile with a recessed face; cork look = canvas-made speckle map
   used as colour + bump. Choreography: every section/article may carry data-pose="x,y,tilt,spin,scale"
   (x/y as fractions of the half viewport, radians, scale). A scrubbed fromTo per pose section moves one
   shared state object; the render loop reads it. Idle: float bob .12 units @ .9rad/s, cursor tilt .15rad. */
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { frameCallbacks, reduced } from './scroll.js';

export const pose = { x: 0, y: -0.08, tilt: 0.25, spin: 0, s: 1 };

function corkTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#a8794f'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {
    const l = Math.random();
    g.fillStyle = l < 0.55 ? `rgba(70,35,12,${0.15 + Math.random() * 0.35})` : `rgba(225,160,95,${0.15 + Math.random() * 0.35})`;
    const r = 0.6 + Math.random() * 2.6;
    g.beginPath(); g.ellipse(Math.random() * 512, Math.random() * 512, r, r * (0.5 + Math.random()), Math.random() * 3, 0, 6.3); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export function initDisc() {
  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  cam.position.z = 8;

  scene.add(new THREE.HemisphereLight(0xffe2c4, 0x2a1608, 0.9));
  const key = new THREE.DirectionalLight(0xffc89a, 2.4); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff7a30, 1.6); rim.position.set(4, -2, -3); scene.add(rim);

  const tex = corkTexture();
  const prof = [[0, -0.16], [1, -0.16], [1, 0.17], [0.86, 0.17], [0.8, 0.0], [0, 0.0]].map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(prof, 96);
  // planar UVs on the faces, cylindrical on the rim (lathe UVs pinch at the centre)
  const P = geo.attributes.position, N = geo.attributes.normal, UV = geo.attributes.uv;
  for (let i = 0; i < P.count; i++) {
    if (Math.abs(N.getY(i)) > 0.5) UV.setXY(i, P.getX(i) * 0.5 + 0.5, P.getZ(i) * 0.5 + 0.5);
    else UV.setXY(i, Math.atan2(P.getZ(i), P.getX(i)) / 6.283 * 3, P.getY(i) * 2);
  }
  const mat = new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: 2.2, roughness: 0.92, metalness: 0 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;            // face toward camera
  const group = new THREE.Group(); group.add(mesh); scene.add(group);

  let W = 1, H = 1, halfH = 1, halfW = 1;
  const resize = () => {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    cam.aspect = W / H; cam.updateProjectionMatrix();
    halfH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.position.z; halfW = halfH * cam.aspect;
  };
  resize(); addEventListener('resize', resize);

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });

  // pose timeline: one scrubbed fromTo per pose element
  const els = [...document.querySelectorAll('[data-pose]')];
  let prev = { ...pose };
  els.forEach((el) => {
    const [x, y, tilt, spin, s] = el.dataset.pose.split(',').map(Number);
    const to = { x, y, tilt, spin, s };
    if (reduced) { Object.assign(pose, to); return; }
    gsap.fromTo(pose, { ...prev }, { ...to, ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 25%', scrub: 0.6 } });
    prev = to;
  });

  const unit = Math.min(1, W / 1400 + 0.3);   // smaller coaster on narrow screens
  frameCallbacks.add((t) => {
    mouse.sx += (mouse.x - mouse.sx) * 0.06; mouse.sy += (mouse.y - mouse.sy) * 0.06;
    const k = reduced ? 0 : 1;
    const sc = pose.s * unit * (W < 800 ? 1.05 : 1.55);
    mesh.visible = pose.s > 0.01;
    group.scale.setScalar(sc);
    group.position.set(pose.x * halfW, pose.y * halfH + Math.sin(t * 0.9) * 0.12 * k, 0);
    group.rotation.set(pose.tilt + mouse.sy * 0.3 * k, pose.spin + mouse.sx * 0.3 * k + Math.sin(t * 0.5) * 0.4 * k, Math.sin(t * 0.6) * 0.06 * k);
    renderer.render(scene, cam);
  });
  ScrollTrigger.addEventListener('refresh', resize);
}
