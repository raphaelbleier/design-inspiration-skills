// Blueprint world. Technique: ~40 wireframe plates + line-box rooms scattered along a CatmullRom spline;
// the camera rides the spline by scroll progress (damped), looking a few % ahead on the same curve.
// Values: fov 55, spline 6 points over z 0 -> -120, damping .06, mouse parallax +-.35 units.
import * as THREE from 'three';
import { makeSketch } from './sketch.js';
import { makePost } from './post.js';

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.028);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);

  const path = new THREE.CatmullRomCurve3([
    [0, 0, 6], [-1.5, 0.6, -20], [2.5, -0.4, -48], [-2, 1, -76], [1.5, -.2, -100], [0, 0, -124],
  ].map((p) => new THREE.Vector3(...p)));

  // sketch plates, placed left/right of the path so the camera passes between them
  const kinds = ['plan', 'gear', 'section', 'scribble'];
  const plates = new THREE.Group(); scene.add(plates);
  for (let i = 0; i < 44; i++) {
    const t = i / 44, p = path.getPoint(t);
    const side = i % 2 ? 1 : -1;
    const tex = makeSketch(kinds[i % 4], i + 1);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: .9 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.2), mat);
    m.position.set(p.x + side * (3.2 + (i % 5) * .9), p.y + Math.sin(i * 1.7) * 2, p.z + (i % 3) * 1.4);
    m.rotation.set(Math.sin(i) * .25, -side * (.5 + (i % 4) * .15), Math.cos(i * 2) * .12);
    plates.add(m);
  }
  // wire rooms: edge-only boxes, the "architecture" of the drawing
  const edge = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45 });
  for (let i = 0; i < 26; i++) {
    const p = path.getPoint((i + .5) / 26), side = i % 2 ? 1 : -1;
    const g = new THREE.BoxGeometry(2 + (i % 4), 1 + (i % 3), 3 + (i % 5));
    const l = new THREE.LineSegments(new THREE.EdgesGeometry(g), edge);
    l.position.set(p.x + side * (1.8 + (i % 3)), p.y - 1.8 + (i % 2) * 3.4, p.z);
    l.rotation.y = i * .4; plates.add(l);
  }
  // ground grid
  const grid = new THREE.GridHelper(260, 130, 0x555555, 0x2a2a2a);
  grid.position.set(0, -3.2, -60); grid.material.transparent = true; grid.material.opacity = .5; scene.add(grid);

  const { composer, ca } = makePost(renderer, scene, camera);
  const state = { target: 0, cur: 0, vel: 0, mx: 0, my: 0 };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h; camera.fov = w < 700 ? 70 : 55; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();
  addEventListener('pointermove', (e) => { state.mx = e.clientX / innerWidth - .5; state.my = e.clientY / innerHeight - .5; });

  const look = new THREE.Vector3();
  function frame(ms) {
    const prev = state.cur;
    state.cur += (state.target - state.cur) * (reduced ? 1 : 0.06);
    state.vel = Math.abs(state.cur - prev) * 60;
    const p = path.getPoint(Math.min(state.cur, .995));
    camera.position.copy(p);
    camera.position.x += state.mx * 0.7; camera.position.y -= state.my * 0.5;
    look.copy(path.getPoint(Math.min(state.cur + .03, 1)));
    camera.lookAt(look);
    ca.uniforms.uSplit.value = 0.0016 + Math.min(state.vel * 0.02, 0.012);
    ca.uniforms.uTime.value = (ms / 1000) % 10;
    composer.render();
  }
  return { state, frame };
}
