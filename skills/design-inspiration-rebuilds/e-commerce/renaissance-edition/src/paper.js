// Technique: full-bleed fragment shader on the panel. Paper = fbm mottling + fine grain + a few vertical
// scratches (amp .06); the cursor leaves a soft warm light that eases after the pointer (lerp .06).
// Values: base #cfcfbf, shadow #aaa995, grain amp .06, light radius .22 (uv), strength .16.
import * as THREE from 'three';
import { frame } from './scroll.js';
const frag = /* glsl */`
precision highp float; uniform vec2 uRes, uMouse; uniform float uTime; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+1.), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i=0;i<5;i++){ s += a*n(p); p = p*2.03+7.; a *= .5; } return s; }
void main(){
  vec2 p = vUv * vec2(uRes.x/uRes.y, 1.);
  float m = fbm(p*2.2 + uTime*.01);
  vec3 col = mix(vec3(.678,.676,.584), vec3(.84,.84,.76), smoothstep(.25,.75,m));
  col -= .06 * h(vUv*uRes + fract(uTime));                       // grain
  float sc = step(.985, h(vec2(floor(vUv.x*uRes.x*.5), 3.))) * n(vec2(vUv.x*40., vUv.y*2.)) * .06;
  col -= sc;                                                      // vertical scratches
  float d = distance(vUv*vec2(uRes.x/uRes.y,1.), uMouse*vec2(uRes.x/uRes.y,1.));
  col += vec3(.95,.92,.8) * exp(-d*d/(.22*.22)) * .16;            // cursor light
  gl_FragColor = vec4(col, 1.);
}`;
export function initPaper() {
  const canvas = document.getElementById('paper');
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'low-power' });
  r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const u = { uRes: { value: new THREE.Vector2() }, uMouse: { value: new THREE.Vector2(.5, .5) }, uTime: { value: 0 } };
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: u, fragmentShader: frag, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.,1.); }' })));
  const target = new THREE.Vector2(.5, .5);
  const panel = document.getElementById('panel');
  addEventListener('pointermove', (e) => { const b = panel.getBoundingClientRect(); target.set((e.clientX - b.left) / b.width, 1 - (e.clientY - b.top) / b.height); });
  const size = () => { const b = panel.getBoundingClientRect(); r.setSize(b.width, b.height, false); u.uRes.value.set(b.width * r.getPixelRatio(), b.height * r.getPixelRatio()); };
  new ResizeObserver(size).observe(panel); size();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  frame.push((t) => { u.uTime.value = reduce ? 0 : t; u.uMouse.value.lerp(target, .06); r.render(scene, cam); });
}
