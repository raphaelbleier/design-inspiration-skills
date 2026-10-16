/* Hero WebGL: a green corner room lit from a ceiling lamp, a floating pouch and a pill.
   Technique: Three.js, 2 wall planes meeting at a vertical edge + floor, one SpotLight aimed at the
   pouch, an additive cone mesh as the visible light shaft, ~160 Points as drifting dust.
   Exact values: camera fov 32 at z 7.4, pouch box 1.25 x 1.75 x .1, spot angle .55 penumbra .7,
   mouse parallax +-.35 on camera x/y lerped .06, scroll progress p spins the pouch 1.6 turns,
   pushes the camera in 1.4 units and ramps the lamp intensity x3 (the "bloom" overlay takes over). */
import * as THREE from 'three';
import { onFrame, reduced } from './scroll.js';

function noiseTexture(base, amount) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  const d = g.getImageData(0, 0, 256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const n = (Math.random() - 0.5) * amount; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; }
  g.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function pouchTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 720;
  const g = c.getContext('2d');
  g.fillStyle = '#0a9f4a'; g.fillRect(0, 0, 512, 720);
  g.fillStyle = '#0c7a3a'; g.beginPath(); g.arc(120, 520, 330, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#10b45a'; g.beginPath(); g.arc(430, 150, 190, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; g.font = '700 150px "Inter Tight", Arial, sans-serif'; g.save(); g.translate(40, 250); g.rotate(-0.12);
  g.fillText('/lumo', 0, 0); g.restore();
  g.font = '500 34px "Inter Tight", Arial, sans-serif'; g.fillText('Quiet', 80, 450); g.fillText('Inner', 80, 492); g.fillText('Power', 80, 534);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

export function initStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x0b2a1a);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b2a1a, 9, 20);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);

  // room: two walls meeting at x=0 (seen as a corner) + floor
  const wallMat = new THREE.MeshStandardMaterial({ map: noiseTexture('#3f9a63', 40), roughness: 0.95, color: 0x6f9f82 });
  const wl = new THREE.Mesh(new THREE.PlaneGeometry(10, 9), wallMat); wl.position.set(-3.5, 1, -3.5); wl.rotation.y = Math.PI / 4;
  const wr = wl.clone(); wr.position.x = 3.5; wr.rotation.y = -Math.PI / 4;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), wallMat); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -2.6, -1);
  scene.add(wl, wr, floor);

  scene.add(new THREE.AmbientLight(0x6fd6a0, 0.65));
  const front = new THREE.DirectionalLight(0xffffff, 1.2); front.position.set(1.5, 2, 6); scene.add(front);
  const spot = new THREE.SpotLight(0xeaffe6, 60, 14, 0.55, 0.7, 1.2); spot.position.set(0, 2.3, 0.3);
  const target = new THREE.Object3D(); target.position.set(0, -1.2, 0); scene.add(target); spot.target = target; scene.add(spot);

  // visible lamp + light shaft
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 0.85), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  lamp.position.set(0, 1.62, 0.3); lamp.rotation.set(0.35, Math.PI / 4, 0); scene.add(lamp);
  const shaft = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4.4, 48, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x9dffb8, transparent: true, opacity: 0.012, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  shaft.position.set(0, -0.15, 0.3); scene.add(shaft);

  // pouch + pill
  const group = new THREE.Group(); scene.add(group);
  const face = new THREE.MeshStandardMaterial({ map: pouchTexture(), roughness: 0.38, metalness: 0.15 });
  const edge = new THREE.MeshStandardMaterial({ color: 0x0b8a40, roughness: 0.5 });
  const pouch = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.75, 0.1), [edge, edge, edge, edge, face, face]);
  pouch.rotation.set(0.08, 0, -0.16); group.add(pouch);
  const pill = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.34, 8, 24), new THREE.MeshStandardMaterial({ color: 0xf1f6ef, roughness: 0.3 }));
  pill.position.set(0.72, -0.6, 0.5); pill.rotation.z = 0.6; group.add(pill);

  // dust
  const N = 160, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 8; pos[i * 3 + 1] = (Math.random() - 0.5) * 6; pos[i * 3 + 2] = (Math.random() - 0.5) * 5; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xb8ffd0, size: 0.04, transparent: true, opacity: 0.8, depthWrite: false }));
  scene.add(dust);

  const state = { p: 0, mx: 0, my: 0, cx: 0, cy: 0 };
  addEventListener('pointermove', (e) => { state.mx = e.clientX / innerWidth - 0.5; state.my = e.clientY / innerHeight - 0.5; });
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.position.z = w / h < 0.8 ? 8.6 : 7.4; camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize); resize();

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const render = (time) => {
    if (!visible) return;
    const p = state.p;
    state.cx += (state.mx - state.cx) * 0.06; state.cy += (state.my - state.cy) * 0.06;
    camera.position.x = state.cx * 0.7; camera.position.y = 0.2 - state.cy * 0.7;
    camera.position.z = (camera.aspect < 0.8 ? 8.6 : 7.4) - p * 1.4;
    camera.lookAt(0, 0, 0);
    group.position.y = Math.sin(time * 1.1) * 0.08;
    pouch.rotation.y = p * Math.PI * 3.2 + state.cx * 0.4;
    pill.rotation.y = time * 0.6; pill.position.x = 0.72 + Math.sin(time * 0.8) * 0.05;
    spot.intensity = 60 + p * 120; shaft.material.opacity = 0.012 + p * 0.3; lamp.scale.setScalar(1 + p * 2);
    dust.position.y = (time * 0.05) % 1 - 0.5;
    renderer.render(scene, camera);
  };
  render(0);                                       // one frame even when reduced motion (static scene)
  if (!reduced) onFrame(render);
  return { setProgress: (p) => { state.p = p; } };
}
