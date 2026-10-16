// Technique: Three.js trophy in the awards section. A tall black glossy slab with a brass inlay,
// rotated by scroll (scrubbed rotation.y 0 -> 2PI) and tilted toward the cursor (lerp .06).
// Transparent canvas over the black section; 2 lights (white key, cool blue rim). Pixel ratio capped at 2.
import * as THREE from 'three';
import gsap from 'gsap';

export function initTrophy(reduce) {
  const canvas = document.getElementById('trophy');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  cam.position.set(0, 0, 9);
  scene.add(new THREE.AmbientLight(0x404050, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 3); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x3a6bff, 4); rim.position.set(-4, 1, -2); scene.add(rim);

  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4.2, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0c, metalness: 0.7, roughness: 0.22 }));
  const brass = new THREE.MeshStandardMaterial({ color: 0xb08a3c, metalness: 1, roughness: 0.28 });
  const inlay = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 1.54), brass);
  inlay.position.y = -1.2;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.12, 1.56), brass);
  cap.position.y = 2.16;
  g.add(body, inlay, cap);
  g.rotation.x = 0.12;
  scene.add(g);

  const size = () => {
    const r = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    cam.aspect = r.width / r.height; cam.updateProjectionMatrix();
    g.position.x = r.width > 900 ? 0 : 0.6;
    g.scale.setScalar(r.width > 900 ? 1 : 0.8);
  };
  size(); addEventListener('resize', size);

  const m = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => { m.tx = e.clientX / innerWidth - 0.5; m.ty = e.clientY / innerHeight - 0.5; });
  const spin = { y: 0.5 };
  if (!reduce) gsap.to(spin, { y: 0.5 + Math.PI * 2, ease: 'none',
    scrollTrigger: { trigger: '.awards', start: 'top bottom', end: 'bottom top', scrub: true } });

  let visible = false;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  gsap.ticker.add(() => {
    if (!visible) return;
    m.x += (m.tx - m.x) * 0.06; m.y += (m.ty - m.y) * 0.06;
    g.rotation.y = spin.y + m.x * 0.8;
    g.rotation.x = 0.12 + m.y * 0.4;
    renderer.render(scene, cam);
  });
}
