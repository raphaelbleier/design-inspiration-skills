// Technique: one WebGL canvas, orthographic camera in CSS pixels. Ten cut-out models stand
// in a row; hover dims the others to 22% + desaturates them, scales the hovered one 1.06 and
// crossfades to its second pose. Row height = 11vw (desktop), spacing = 8vw, lerp .12 per frame.
// Narrow screens: row is wider than the screen and is dragged horizontally.
import * as THREE from 'three';
import { products } from './data.js';

const frag = /* glsl */`
  uniform sampler2D uA, uB; uniform float uMix, uDim, uHas;
  varying vec2 vUv;
  void main() {
    vec4 a = texture2D(uA, vUv), b = texture2D(uB, vUv);
    vec4 c = mix(a, b, uMix);
    // images arrive later: until then show a soft silhouette block
    if (uHas < 0.5) { float s = step(abs(vUv.x - .5), .22) * step(.04, vUv.y) * step(vUv.y, .96); c = vec4(vec3(.74), s * .55); }
    float g = dot(c.rgb, vec3(.299, .587, .114));
    c.rgb = mix(vec3(g), c.rgb, uDim);        // desaturate when dimmed
    c.a *= mix(.22, 1., uDim);                // and fade to 22%
    gl_FragColor = c;
  }`;
const vert = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }';

export function createRow(canvas, onPick) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10);
  const loader = new THREE.TextureLoader();
  const blank = new THREE.Texture();
  const geo = new THREE.PlaneGeometry(1, 1);

  const items = products.map((p, i) => {
    const mat = new THREE.ShaderMaterial({
      transparent: true, vertexShader: vert, fragmentShader: frag,
      uniforms: { uA: { value: blank }, uB: { value: blank }, uMix: { value: 0 }, uDim: { value: 1 }, uHas: { value: 0 } },
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    const load = (url, key) => loader.load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace; mat.uniforms[key].value = t;
      if (key === 'uA') mat.uniforms.uHas.value = 1;
    }, undefined, () => {});
    load(p.a, 'uA'); load(p.b, 'uB');
    return { mesh, mat, i, mix: 0, dim: 1, scale: 1 };
  });

  const S = { w: 1, h: 1, ih: 0, step: 0, dragX: 0, minDrag: 0, hover: -1, lift: 0, narrow: false };
  function layout() {
    S.w = innerWidth; S.h = innerHeight; S.narrow = S.w < 768;
    renderer.setSize(S.w, S.h, false);
    Object.assign(cam, { left: 0, right: S.w, top: S.h, bottom: 0 }); cam.updateProjectionMatrix();
    S.ih = S.narrow ? S.w * 0.46 : S.w * 0.11;
    S.step = S.narrow ? S.w * 0.28 : S.w * 0.08;
    const rowW = S.step * (items.length - 1);
    S.minDrag = S.narrow ? Math.min(0, S.w - rowW - S.step) : 0;
    S.dragX = Math.max(S.dragX, S.minDrag);
  }
  layout(); addEventListener('resize', layout);

  const rowX = (i) => (S.narrow ? S.step * 0.6 + S.dragX : (S.w - S.step * (items.length - 1)) / 2) + i * S.step;
  const rowY = () => S.h * 0.5 + S.lift;

  function pick(clientX, clientY) {
    if (S.narrow) return -1;
    let best = -1, bd = S.step * 0.55;
    items.forEach((it, i) => { const d = Math.abs(clientX - rowX(i)); if (d < bd && Math.abs(clientY - (S.h - rowY())) < S.ih * 0.6) { bd = d; best = i; } });
    return best;
  }
  function setHover(i) { if (i !== S.hover) { S.hover = i; onPick(i); } }
  addEventListener('pointermove', (e) => { if (!drag) setHover(pick(e.clientX, e.clientY)); });

  let drag = null;
  addEventListener('pointerdown', (e) => { if (S.narrow && e.target.closest('main')) drag = { x: e.clientX, base: S.dragX }; });
  addEventListener('pointermove', (e) => { if (drag) S.dragX = Math.min(0, Math.max(S.minDrag, drag.base + e.clientX - drag.x)); });
  addEventListener('pointerup', () => { drag = null; });

  function frame() {
    items.forEach((it) => {
      const hov = S.hover === it.i, any = S.hover >= 0;
      it.mix += ((hov ? 1 : 0) - it.mix) * 0.12;
      it.dim += ((!any || hov ? 1 : 0) - it.dim) * 0.12;
      it.scale += ((hov ? 1.06 : 1) - it.scale) * 0.12;
      const u = it.mat.uniforms; u.uMix.value = it.mix; u.uDim.value = it.dim;
      const h = S.ih * it.scale;
      it.mesh.scale.set(h * 0.5, h, 1);
      it.mesh.position.set(rowX(it.i), rowY(), 0);
    });
    renderer.render(scene, cam);
  }
  return { frame, state: S };
}
