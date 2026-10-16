/**
 * particles.js - the "AI scan" dots over the truck (Three.js, ortho camera, one Points draw call).
 * 2600 dots start packed on the truck rectangle (x .22-.82, y .42-.66 of the screen) and
 * disperse into the yard as uProgress goes 0 -> 1. A sweep front (x = uProgress * 1.25 - .15)
 * makes dots appear left to right; size 1.6-3.4px, additive white-ish blue, fades at progress > .85.
 */
import * as THREE from 'three';
import { onFrame } from './scroll.js';

export function initParticles(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(0, 1, 1, 0, -1, 1);   // 0..1 screen space, y down

  const N = 2600;
  const pos = new Float32Array(N * 3), seed = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = 0.22 + Math.random() * 0.6;          // start x
    pos[i * 3 + 1] = 0.42 + Math.random() * 0.24;     // start y
    seed[i * 4] = Math.random() * 2 - 1; seed[i * 4 + 1] = Math.random() * 2 - 1;   // drift dir
    seed[i * 4 + 2] = Math.random(); seed[i * 4 + 3] = 1.6 + Math.random() * 1.8;   // phase, size
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 4));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: { uP: { value: 0 }, uT: { value: 0 }, uDpr: { value: renderer.getPixelRatio() } },
    vertexShader: /* glsl */`
      attribute vec4 seed; uniform float uP, uT, uDpr; varying float vA;
      void main() {
        vec3 p = position;
        float sweep = uP * 1.25 - 0.15;
        float on = smoothstep(sweep + .08, sweep - .02, p.x);          // dots behind the front appear
        float spread = smoothstep(.15, 1., uP);                         // then scatter outward
        p.xy += seed.xy * spread * vec2(.34, .3) * (.4 + seed.z);
        p.y += sin(uT * .8 + seed.z * 6.28) * .004;                     // idle drift
        vA = on * (1. - smoothstep(.85, 1., uP)) * (.35 + .65 * seed.z);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
        gl_PointSize = seed.w * uDpr;
      }`,
    fragmentShader: /* glsl */`
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - .5);
        float a = smoothstep(.5, .15, d) * vA;
        gl_FragColor = vec4(.85, .93, 1., a);
      }`,
  });
  scene.add(new THREE.Points(geo, mat));

  const resize = () => { renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); };
  resize(); addEventListener('resize', resize);
  let dirty = true;
  onFrame((t) => { mat.uniforms.uT.value = t; if (mat.uniforms.uP.value > 0 && mat.uniforms.uP.value < 1) dirty = true; if (dirty) { renderer.render(scene, cam); dirty = false; } });
  return { set progress(v) { mat.uniforms.uP.value = v; dirty = true; } };
}
