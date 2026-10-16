// Fixed 3D crystal: two chrome octahedron halves (split apart in the hero) + dashed wire box overlays.
// Scroll drives position (hero centre -> right column), rotation and the split; wireframe mix in the dark frame.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
export const crystal = { p: 0, wire: 0 };
export function initCrystal(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, .1, 50); cam.position.z = 9;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223355, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 3); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x5b8cff, 2.5); rim.position.set(-4, -1, -2); scene.add(rim);
  const pyr = new THREE.ConeGeometry(1.5, 2.1, 4, 1); pyr.rotateY(Math.PI / 4);
  const env = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture; scene.environment = env;
  const solid = new THREE.MeshStandardMaterial({ color: 0xd5dae2, metalness: .9, roughness: .18, flatShading: true, transparent: true });
  const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  const g = new THREE.Group(), top = new THREE.Group(), bot = new THREE.Group(), mats = [];
  for (const [grp, sy] of [[top, 1], [bot, -1]]) {
    const m = new THREE.Mesh(pyr, solid.clone()); mats.push(m.material);
    grp.add(m, new THREE.LineSegments(new THREE.EdgesGeometry(pyr), wireMat));
    grp.scale.y = sy; g.add(grp);
  }
  scene.add(g); r.setClearColor(0x000000, 0);
  let w = 1;
  const size = () => { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); w = innerWidth; };
  size(); addEventListener('resize', size);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const s = { x: 0, rot: 0, split: 0, scale: 1 };
  return (t) => {
    const p = crystal.p; // 0 hero ... 1 end of page
    const narrow = w < 900;
    const tx = narrow ? 0 : THREE.MathUtils.lerp(0, 2.6, THREE.MathUtils.smoothstep(p, 0.02, 0.12));
    s.x += (tx - s.x) * .08;
    g.position.set(s.x, narrow ? -1.0 : 0, 0);
    g.rotation.y = (reduce ? 0 : t * .35) + p * 12;
    g.rotation.z = Math.sin(p * 8) * .25;
    const split = Math.max(0, 1 - p * 14) * .25 + .02;
    top.position.y = split; bot.position.y = -split;
    const sc = narrow ? .5 : .75; g.scale.setScalar(sc * (1 + Math.sin(p * 20) * .05));
    mats.forEach((m) => (m.opacity = 1 - crystal.wire));
    wireMat.opacity = .25 + crystal.wire * .6;
    r.render(scene, cam);
  };
}
