/**
 * Scene compositor + the signature "frost wipe" transition (the brand moment).
 *
 * TECHNIQUE: every page renders into its own render target. A fullscreen triangle
 * (one oversized triangle, no quad seam) mixes tA / tB in a fragment shader:
 *  1. DIAGONAL WIPE  edge value m = uv.y - 0.2*aspect*(uv.x-.5); the cut threshold travels
 *     from -0.4 to 1.4 with p. The edge is displaced by the frost texture (R = ice cut x .4,
 *     B = slope bend), so the front looks like cracking ice, not a straight line.
 *  2. PARALLAX      scene A slides 0.4*p^2, scene B slides 0.4*(1-p)^2 (power2.in), opposite ways.
 *  3. GLITCH        blocks of the screen are horizontally dragged by the frost G channel,
 *     amplitude 0.025 * (velocity + edge band) - this is the "pixels dragged" look.
 *  4. CHROMATIC     5 spectral taps with barrel distortion; strength = rest 0.0025 +
 *     edge band + scroll velocity, masked by a vignette (stronger at the borders).
 *  5. FINISH        blue-noise-like grain (hides banding), soft vignette, cool lift.
 */
import * as THREE from 'three';
import { createFrostTexture } from './frost-texture.js';
import { COLORS } from './config.js';

const VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = position.xy * .5 + .5; gl_Position = vec4(position.xy, 0., 1.); }
`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tA, tB, tFrost;
uniform float uProgress, uVel, uAspect, uTime, uReduce;
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float p2in(float x){ return x * x; }
vec3 spectrum(float t){ return vec3(clamp(1. - 2. * t, 0., 1.), 1. - abs(2. * t - 1.), clamp(2. * t - 1., 0., 1.)); }

void main(){
  vec2 uv = vUv;
  float p = uProgress;
  vec2 q = uv - .5;

  // frost lookups (aspect-correct so the cells stay square)
  vec3 fr = texture2D(tFrost, uv * vec2(uAspect, 1.) * .9 + vec2(0., p * .15)).rgb;

  // diagonal wipe
  float slope = -.2 * uAspect;
  float m = uv.y + slope * (uv.x - .5);
  float thr = mix(-.45, 1.45, p);
  float ice = (fr.r - .5) * .42 + (fr.b - .5) * .25;
  float d = m + ice - thr;                 // <0 : B side, >0 : A side
  float mask = smoothstep(-.012, .012, d); // 1 -> show A
  float band = exp(-abs(d) * 9.) * step(.001, p) * step(p, .999); // edge glow zone

  // glitch: dragged blocks near the edge / when scrolling fast
  vec2 cell = floor(uv * vec2(46., 26.));
  float rnd = hash(cell + floor(uTime * 9.));
  float glitchAmt = (band * .9 + uVel * .6) * (1. - uReduce);
  float drag = (fr.g - .5) * .05 * glitchAmt + (step(.82, rnd) * (rnd - .9)) * .05 * glitchAmt;

  // parallax slide (A up, B arrives from below)
  float sa = .4 * p2in(p);
  float sb = .4 * p2in(1. - p);

  // chromatic aberration: 5 spectral taps + barrel distortion
  float ca = .0012 + band * .014 + uVel * .007;
  ca *= (.25 + dot(q, q) * 1.6);           // vignette-masked: stronger at the edges
  ca *= (1. - .7 * uReduce);
  vec3 col = vec3(0.), wsum = vec3(0.);
  for (int i = 0; i < 5; i++){
    float t = float(i) / 4.;
    float k = (t - .5) * 2.;               // -1..1 across the spectrum
    vec2 uvk = .5 + q * (1. + k * ca * 6. * (1. + dot(q, q) * 1.4)); // barrel
    uvk.x += drag;
    vec2 ua = vec2(uvk.x, uvk.y - sa);
    vec2 ub = vec2(uvk.x, uvk.y + sb);
    vec3 w = spectrum(t);
    vec3 a = texture2D(tA, clamp(ua, .001, .999)).rgb;
    vec3 b = texture2D(tB, clamp(ub, .001, .999)).rgb;
    col += mix(b, a, mask) * w;
    wsum += w;
  }
  col /= wsum;

  // no black voids mid-wipe: lift darks towards fog, strongest at the middle of the handover
  col = max(col, vec3(.34, .37, .43) * sin(3.14159 * p));

  // frost sheen on the cut itself
  col += band * vec3(.55, .68, .9) * .14 * (1. - uReduce);

  // grain (blue-noise-ish) + vignette
  float g = hash(uv * 1000. + fract(uTime) * 91.) - .5;
  col += g * .028;
  col *= 1. - dot(q, q) * .22;
  gl_FragColor = vec4(col, 1.);
}
`;

export function createTransition(renderer) {
  const frost = createFrostTexture();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tA: { value: null }, tB: { value: null }, tFrost: { value: frost },
      uProgress: { value: 0 }, uVel: { value: 0 }, uAspect: { value: 1 }, uTime: { value: 0 }, uReduce: { value: 0 },
    },
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const opts = { type: THREE.HalfFloatType, depthBuffer: true, samples: 0 };
  const rtA = new THREE.WebGLRenderTarget(4, 4, opts);
  const rtB = new THREE.WebGLRenderTarget(4, 4, opts);

  return {
    rtA, rtB, uniforms: mat.uniforms,
    resize(w, h) {
      rtA.setSize(w, h); rtB.setSize(w, h);
      mat.uniforms.uAspect.value = w / h;
    },
    draw(progress, vel, time, reduce) {
      const u = mat.uniforms;
      u.tA.value = rtA.texture; u.tB.value = rtB.texture;
      u.uProgress.value = progress; u.uVel.value = vel; u.uTime.value = time; u.uReduce.value = reduce ? 1 : 0;
      renderer.setRenderTarget(null);
      renderer.setClearColor(COLORS.bg, 1);
      renderer.clear();
      renderer.render(scene, cam);
    },
  };
}
