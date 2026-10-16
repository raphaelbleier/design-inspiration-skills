/* Ink background: one fullscreen fragment shader (Three.js, one triangle) that IS the page background.
 *
 * Technique
 *  - Palette of 11 flat colours, one per panel. Seam i pours colour i+1 over colour i from the bottom up:
 *      covered where  uv.y < p*1.6 - 0.3 + (noise - .5) * .5     p = per-seam progress 0..1 (scrubbed by scroll)
 *    noise = 60% soft fbm + 40% horizontal brush streaks (uv.y * 18), so the edge looks like a dragged brush.
 *  - Edge is anti-aliased with fwidth, grain = hash noise * .05, cursor bumps the edge: + exp(-d*d*30) * .09
 *  - Hero layer: dark base with slow horizontal lighter streaks (#2b2b2e on #202022), fades out as seam 0 covers it.
 *  - Seam 0 idles at .2 * splash so a white ink blob rises behind the hero once the age gate opens.
 */
import * as THREE from 'three';

// one colour per panel: hero, 3 framed (paper), hand (wood), 3 red scenes, ruins + select (paper), pour (red)
export const COLORS = ['#202022', '#f4f3ef', '#f4f3ef', '#f4f3ef', '#55201f', '#c82924', '#c82924', '#c82924', '#f4f3ef', '#f4f3ef', '#c82924'];
THREE.ColorManagement.enabled = false;   // palette hex values are written to the canvas as-is
const SEAMS = COLORS.length - 1;

export const state = { p: Array.from({ length: SEAMS }, () => ({ v: 0 })), splash: { v: 0 } };

const frag = /* glsl */ `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uMouseAmp;
uniform float uP[${SEAMS}]; uniform vec3 uC[${SEAMS + 1}];
varying vec2 vUv;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 4; i++){ s += a * vnoise(p); p *= 2.03; a *= .5; } return s; }

void main(){
  vec2 uv = vUv; float asp = uRes.x / uRes.y;
  // hero: dark paper with drifting brush streaks
  vec3 col = uC[0];
  float st = fbm(vec2(uv.x * 1.6 + uTime * .02, uv.y * 12.0)) + .35 * fbm(vec2(uv.x * 3.0 - uTime * .03, uv.y * 40.0));
  col = mix(col, vec3(.168, .168, .18), smoothstep(.62, .78, st));

  for (int i = 0; i < ${SEAMS}; i++){
    float p = uP[i];
    if (p <= 0.0) continue;
    vec2 q = vec2(uv.x + float(i) * 3.7, uv.y);
    float n = .6 * fbm(q * vec2(1.5, 3.0)) + .4 * fbm(q * vec2(1.2, 18.0));
    float md = length((uv - uMouse) * vec2(asp, 1.0));
    float thr = p * 1.6 - .3 + (n - .5) * .5 + exp(-md * md * 30.0) * .09 * uMouseAmp * smoothstep(.0, .15, p) * (1.0 - smoothstep(.85, 1., p));
    float d = thr - uv.y;
    float cover = smoothstep(-fwidth(d), fwidth(d), d);
    col = mix(col, uC[i + 1], cover);
  }
  col += (hash(uv * uRes + uTime) - .5) * .05;   // paper grain
  gl_FragColor = vec4(col, 1.0);
}`;

export function initInk(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mat = new THREE.ShaderMaterial({
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: frag,
    uniforms: {
      uRes: { value: new THREE.Vector2() }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(.5, .5) }, uMouseAmp: { value: 1 },
      uP: { value: new Array(SEAMS).fill(0) }, uC: { value: COLORS.map((c) => new THREE.Color(c)) },
    },
  });
  // one oversized triangle
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
  scene.add(new THREE.Mesh(geo, mat));

  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); mat.uniforms.uRes.value.set(canvas.width, canvas.height); };
  addEventListener('resize', resize); resize();

  const mouse = { x: .5, y: .5 }, target = { x: .5, y: .5 };
  addEventListener('pointermove', (e) => { target.x = e.clientX / innerWidth; target.y = 1 - e.clientY / innerHeight; });

  return (timeSec, reduced) => {
    mouse.x += (target.x - mouse.x) * .08; mouse.y += (target.y - mouse.y) * .08;
    const u = mat.uniforms;
    u.uTime.value = reduced ? 0 : timeSec;
    u.uMouse.value.set(mouse.x, mouse.y);
    const arr = u.uP.value;
    for (let i = 0; i < SEAMS; i++) arr[i] = state.p[i].v;
    arr[0] = Math.max(arr[0], .2 * state.splash.v);
    renderer.render(scene, cam);
  };
}
