// Technique: a low-poly Three.js bee in an orthographic pixel-space scene. It chases the cursor with a
// critically damped spring; click drops an orange fruit that falls (gravity 1800 px/s^2), bounces once,
// the bee flies to it, eats it (scale -> 0) and returns to the cursor. Wings flap at 38 Hz.
// Bee faces its travel direction: z-rotation eased toward atan2(vel) * .25, body bob = sin(t*7) * 4px.
import * as THREE from 'three';
import { frame } from './scroll.js';

export function initBee() {
  const canvas = document.getElementById('bee');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.remove(); return; }
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(0, 1, 1, 0, -500, 500);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x887700, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(-1, 2, 3); scene.add(sun);

  const yellow = new THREE.MeshStandardMaterial({ color: 0xf6e61a, roughness: 0.45 });
  const black = new THREE.MeshStandardMaterial({ color: 0x15150f, roughness: 0.6 });
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  const S = innerWidth < 600 ? 26 : 38;
  const bee = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(S, 24, 18), yellow); body.scale.set(1.25, 1, 1);
  const stripe = (x) => { const r = S * Math.sqrt(1 - (x / (S * 1.25)) ** 2) * 1.01; const m = new THREE.Mesh(new THREE.TorusGeometry(r, S * 0.12, 10, 28), black); m.rotation.y = Math.PI / 2; m.position.x = x; return m; };
  const head = new THREE.Mesh(new THREE.SphereGeometry(S * 0.55, 18, 14), black); head.position.x = S * 1.35;
  const wing = (z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(S * 0.7, 14, 10), wingMat); m.scale.set(0.5, 0.08, 1); m.position.set(-S * 0.1, S * 0.7, z * S * 0.5); m.rotation.x = z * 0.5; return m; };
  const wings = [wing(1), wing(-1)];
  bee.add(body, stripe(-S * 0.35), stripe(S * 0.4), stripe(-S * 0.95), head, ...wings);
  scene.add(bee);

  const fruit = new THREE.Mesh(new THREE.SphereGeometry(18, 20, 16), new THREE.MeshStandardMaterial({ color: 0xff5a14, roughness: 0.5 }));
  fruit.visible = false; scene.add(fruit);

  let W = 1, H = 1;
  const resize = () => {
    W = innerWidth; H = innerHeight; renderer.setSize(W, H, false);
    Object.assign(cam, { left: 0, right: W, top: H, bottom: 0 }); cam.updateProjectionMatrix();
  };
  resize(); addEventListener('resize', resize);

  const mouse = { x: W * 0.3, y: H * 0.85 };
  const pos = { x: W * 0.4, y: H * 1.05 }, vel = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  let f = null; // { x, y, vy, bounced }
  document.getElementById('hero').addEventListener('pointerdown', (e) => {
    if (e.target.closest('a,button')) return;
    f = { x: e.clientX, y: e.clientY, vy: 0, bounced: false }; fruit.visible = true; fruit.scale.setScalar(1);
  });

  let prev = 0;
  frame.add((t) => {
    const dt = Math.min(t - prev, 0.05); prev = t; if (!dt) return;
    if (f) {
      f.vy += 1800 * dt; f.y += f.vy * dt;
      const floor = H * 0.62;
      if (f.y > floor) { f.y = floor; f.vy = f.bounced ? 0 : -f.vy * 0.4; f.bounced = true; }
    }
    const tx = f ? f.x : mouse.x + 70, ty = f ? f.y - 20 : mouse.y - 40;
    // critically damped spring: k = 55, c = 2 * sqrt(k)
    const k = 55, c = 2 * Math.sqrt(k);
    vel.x += ((tx - pos.x) * k - vel.x * c) * dt; vel.y += ((ty - pos.y) * k - vel.y * c) * dt;
    pos.x += vel.x * dt; pos.y += vel.y * dt;
    if (f && f.bounced && Math.hypot(tx - pos.x, ty - pos.y) < 26) {
      const g = f; f = null;
      const t0 = performance.now();
      const shrink = () => { const p = (performance.now() - t0) / 350; fruit.scale.setScalar(Math.max(0, 1 - p)); if (p < 1) requestAnimationFrame(shrink); else fruit.visible = false; };
      shrink(); void g;
    }
    const bob = Math.sin(t * 7) * 4;
    bee.position.set(pos.x, H - pos.y + bob, 0);
    const lean = Math.atan2(-vel.y, Math.abs(vel.x) + 40) * 0.25;
    bee.rotation.z += ((vel.x < -20 ? Math.PI - lean : lean) - bee.rotation.z) * 0.12;
    bee.rotation.y = Math.sin(t * 1.3) * 0.2;
    const flap = Math.sin(t * Math.PI * 2 * 38) * 0.7;
    wings[0].rotation.x = 0.5 + flap; wings[1].rotation.x = -0.5 - flap;
    if (f) fruit.position.set(f.x, H - f.y, 0);
    renderer.render(scene, cam);
  });
}
