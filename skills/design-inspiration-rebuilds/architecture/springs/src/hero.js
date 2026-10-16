/**
 * hero.js - the signature: a full-bleed WebGL field of portrait photo cards, tilted ~-30deg,
 * drifting slowly along their own long axis; scroll/wheel velocity adds speed.
 * Technique: orthographic Three.js scene in CSS pixels, one rotated Group of PlaneGeometry
 * cards (300x415, gap 24) in staggered columns, cover-fit UVs in the fragment shader,
 * texture fade-in on load, a CSS gradient (teal -> forest, olive glow bottom-left) on top.
 * Drift 0.35px/frame + |scroll velocity| * 1.6, damped lerp .08. Pointer parallax +-14px.
 * Respects prefers-reduced-motion: renders one still frame.
 */
import * as THREE from 'three';
import gsap from 'gsap';
import { state, reduced } from './scroll.js';

const CARD_W = 300, CARD_H = 415, GAP = 24, TILT = -0.52;   // radians
const IMGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10'];
const COLORS = ['#2f5a4a', '#3d6b57', '#27504a', '#456e5d', '#35624f'];

const vert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const frag = `
  uniform sampler2D uTex; uniform float uHas, uMix, uAspect; uniform vec3 uColor; varying vec2 vUv;
  void main(){
    vec2 uv = vUv;
    // cover-fit: crop the longer side of the texture to the card aspect
    float ta = uAspect;                       // texture w/h
    float ca = ${(CARD_W / CARD_H).toFixed(4)};
    if (ta > ca) uv.x = (uv.x - .5) * (ca / ta) + .5; else uv.y = (uv.y - .5) * (ta / ca) + .5;
    vec3 tex = texture2D(uTex, uv).rgb;
    gl_FragColor = vec4(mix(uColor, tex, uHas * uMix), 1.0);
  }`;

export function initHero() {
  const canvas = document.getElementById('heroCanvas');
  const hero = document.getElementById('hero');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x0d3a2e);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  const group = new THREE.Group();
  group.rotation.z = TILT;
  scene.add(group);

  const loader = new THREE.TextureLoader();
  const base = import.meta.env.BASE_URL;
  const cols = 9, rows = 7;
  const stepX = CARD_W + GAP, stepY = CARD_H + GAP;
  const cards = [];
  let n = 0;
  for (let c = -4; c < cols - 4; c++) {
    for (let r = -3; r < rows - 3; r++) {
      const name = IMGS[n % IMGS.length];
      const mat = new THREE.ShaderMaterial({
        vertexShader: vert, fragmentShader: frag,
        uniforms: { uTex: { value: null }, uHas: { value: 0 }, uMix: { value: 0 }, uAspect: { value: 0.72 },
          uColor: { value: new THREE.Color(COLORS[n % COLORS.length]) } },
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(CARD_W, CARD_H), mat);
      // staggered columns: odd columns are shifted by half a card
      mesh.userData = { x: c * stepX, y: r * stepY + (c % 2 ? stepY / 2 : 0) };
      group.add(mesh); cards.push(mesh);
      loader.load(`${base}img/${name}.webp`, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        mat.uniforms.uTex.value = t; mat.uniforms.uHas.value = 1;
        mat.uniforms.uAspect.value = t.image.width / t.image.height;
        gsap.to(mat.uniforms.uMix, { value: 1, duration: 1.2, ease: 'power2.out' });
      }, undefined, () => {});
      n++;
    }
  }

  const span = rows * stepY;
  let offset = 0, speed = 0.35, px = 0, py = 0, tx = 0, ty = 0;
  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    cam.left = -w / 2; cam.right = w / 2; cam.top = h / 2; cam.bottom = -h / 2; cam.updateProjectionMatrix();
    const s = w < 700 ? 0.62 : 1;      // smaller cards on phones
    group.scale.setScalar(s);
    group.position.set(w * 0.04, 0, 0);
  }
  addEventListener('resize', resize); resize();
  hero.addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 28; ty = (e.clientY / innerHeight - 0.5) * 28;
  });

  function frame() {
    const target = 0.35 + Math.abs(state.velocity) * 1.6;
    speed += (target - speed) * 0.08;
    offset = (offset + speed) % span;
    px += (tx - px) * 0.06; py += (ty - py) * 0.06;
    for (const m of cards) {
      // wrap each card along the group's local y so the field never runs out
      let y = m.userData.y + offset;
      y = ((y + span / 2 + stepY * 4) % span) - span / 2 - stepY * 0;
      m.position.set(m.userData.x + px, y - py, 0);
    }
    renderer.render(scene, cam);
  }
  if (reduced) { frame(); return; }
  gsap.ticker.add(() => { if (scrollY < innerHeight * 1.1) frame(); });
}
