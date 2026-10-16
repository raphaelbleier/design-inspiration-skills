/* Chapter 3 molecule: a hexagonal ring with three side groups, drawn as soft white atoms joined by
   dotted bonds (Points along each segment). Technique: second Three.js renderer with a transparent
   canvas, orthographic-ish perspective (fov 28), whole group rotates y .12 rad/s plus scroll-driven
   spin of 1.6 turns across the chapter; atoms are Sprites with a radial-gradient texture. */
import * as THREE from 'three';
import { onFrame, reduced } from './scroll.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function glow() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, '#fff'); r.addColorStop(0.55, 'rgba(255,255,255,.95)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}

export function initMolecule(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50); camera.position.z = 15;
  const group = new THREE.Group(); scene.add(group);

  const ring = [...Array(6)].map((_, i) => new THREE.Vector3(Math.cos(i * Math.PI / 3) * 1.5, Math.sin(i * Math.PI / 3) * 1.5, (i % 2) * 0.4));
  const atoms = [...ring, new THREE.Vector3(3.1, 0.8, 0.5), new THREE.Vector3(-0.2, -3.0, -0.4), new THREE.Vector3(-2.9, 1.9, 0.8), new THREE.Vector3(4.4, 2.2, -0.2)];
  const bonds = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [4, 7], [2, 8], [6, 9]];
  const tex = glow();
  atoms.forEach((p, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false })); s.position.copy(p); s.scale.setScalar(i < 6 ? 0.62 : 0.8); group.add(s); });
  const pts = [];
  bonds.forEach(([a, b]) => { for (let t = 0.12; t < 0.9; t += 0.045) pts.push(atoms[a].clone().lerp(atoms[b], t)); });
  group.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(pts), new THREE.PointsMaterial({ color: 0xffffff, size: 0.075, transparent: true, opacity: 0.9, depthWrite: false })));
  group.position.set(0.8, -0.2, 0);

  const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();
  let spin = 0, visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  if (!reduced) ScrollTrigger.create({ trigger: '#science', start: 'top top', end: 'bottom bottom', scrub: 0.6, onUpdate: (s) => { spin = s.progress * Math.PI * 3.2; } });
  const render = (t = 0) => {
    if (!visible && t) return;
    group.rotation.y = spin * 0.5 + t * 0.12; group.rotation.x = 0.35 + Math.sin(t * 0.3) * 0.06; group.rotation.z = -0.3;
    renderer.render(scene, camera);
  };
  render(0); if (!reduced) onFrame(render);
}
