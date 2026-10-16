/**
 * Ink post-process: the technique that makes a 3D world read as a hand-inked animation.
 *
 * Passes per frame (original: custom MultipleRenderPass + full-screen outline shader + 3D LUT):
 *  1. colour pass  -> rtColor   (4x MSAA, HalfFloat so toon ramps do not band)
 *  2. normal pass  -> rtNormal  (same scene, scene.overrideMaterial = MeshNormalMaterial{flatShading}, + depthTexture)
 *  3. composite    -> screen    full-screen triangle:
 *       - ink where view-space normals differ between neighbours (crease lines) or linear depth jumps (silhouettes);
 *         lines are only drawn on geometry pixels (depth < 1) so they hug the object, colour #363a3c
 *       - the neighbour sample offset is jittered every 1/8s ("boil": lines wobble like stop-motion)
 *       - thickness = 3.2 * clamp(height/900, 0.7, 1.4) buffer pixels (original: scale = min(1, h/1300), thickness 1)
 *       - sky pixels (depth == 1) get a posterised fbm cloud field (two hard thresholds, no gradients)
 *         plus an optional "atmosphere" blob around the planet with a noisy hard edge
 *       - uFlash = vibrance + brightness/contrast kick used by the intro->game transition
 *       - a simple contrast/saturation grade replaces the original 3D LUT
 * Objects that must not be inked (particles) set userData.noInk = true and are hidden in the normal pass.
 */
import * as THREE from 'three';

const frag = /* glsl */ `
precision highp float;
uniform sampler2D tColor, tNormal, tDepth;
uniform vec2 uRes; uniform float uThick, uTime, uNear, uFar, uFlash, uAtmo, uAspect;
uniform vec3 uInk, uSkyA, uSkyB, uSkyC, uAtmoCol;
uniform vec2 uCloudOff, uAtmoC; uniform float uAtmoR;
varying vec2 vUv;
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i = 0; i < 4; i++){ s += a*vn(p); p *= 2.03; a *= .5; } return s; }
float lin(float d){ float z = d*2.-1.; return (2.*uNear*uFar) / (uFar + uNear - z*(uFar - uNear)); }
void main(){
  float d0 = texture2D(tDepth, vUv).r;
  vec4 c4 = texture2D(tColor, vUv); vec3 col = c4.rgb;
  if (d0 > 0.99999) {
    float t = floor(uTime * 8.) / 8.;
    vec2 p = vUv * vec2(uAspect, 1.) * 2.6 + uCloudOff + vec2(t * 0.012, 0.);
    float n = fbm(p);
    col = uSkyA;
    col = mix(col, uSkyB, step(.63, n));
    col = mix(col, uSkyC, step(.78, fbm(p * 1.3 + 4.)));
    vec2 q = (vUv - uAtmoC) * vec2(uAspect, 1.);
    float r = length(q) + (fbm(q * 7. + t) - .5) * .09;
    col = mix(col, uAtmoCol, step(r, uAtmoR) * uAtmo);
    col = mix(col, c4.rgb, c4.a); // un-inked sprites (particles) drawn in the colour pass only
  } else {
    vec2 o = uThick / uRes;
    vec2 jit = (vec2(h21(vec2(floor(uTime*8.), 1.)), h21(vec2(floor(uTime*8.), 2.))) - .5) * 1.2 / uRes;
    vec3 n0 = texture2D(tNormal, vUv).rgb;
    float dl = lin(d0), nd = 0., dd = 0.;
    vec2 offs[4]; offs[0] = vec2(o.x, 0.); offs[1] = vec2(-o.x, 0.); offs[2] = vec2(0., o.y); offs[3] = vec2(0., -o.y);
    for (int i = 0; i < 4; i++) {
      vec2 u = vUv + offs[i] + jit;
      nd = max(nd, length(n0 - texture2D(tNormal, u).rgb));
      dd = max(dd, abs(dl - lin(texture2D(tDepth, u).r)) / dl);
    }
    float e = max(smoothstep(.35, .7, nd), smoothstep(.015, .04, dd));
    col = mix(col, uInk, e * .92);
  }
  float l = dot(col, vec3(.299, .587, .114));
  col = mix(vec3(l), col, 1.08 + .6 * uFlash);
  col = (col - .5) * (1.06 + .25 * uFlash) + .5 + .18 * uFlash;
  gl_FragColor = vec4(col, 1.);
  #include <colorspace_fragment>
}`;

export class InkPipeline {
  constructor(renderer) {
    this.r = renderer;
    const mk = (opts) => new THREE.WebGLRenderTarget(4, 4, { ...opts });
    this.rtColor = mk({ type: THREE.HalfFloatType, samples: 4 });
    this.rtNormal = mk({ depthTexture: new THREE.DepthTexture(4, 4) });
    this.normalMat = new THREE.MeshNormalMaterial({ flatShading: true });
    const u = (v) => ({ value: v });
    this.u = {
      tColor: u(this.rtColor.texture), tNormal: u(this.rtNormal.texture), tDepth: u(this.rtNormal.depthTexture),
      uRes: u(new THREE.Vector2(1, 1)), uThick: u(3.2), uTime: u(0), uNear: u(1), uFar: u(1000), uFlash: u(0),
      uAtmo: u(0), uAspect: u(1), uInk: u(new THREE.Color('#363a3c')),
      uSkyA: u(new THREE.Color('#62BEBB')), uSkyB: u(new THREE.Color('#68c6c0')), uSkyC: u(new THREE.Color('#70cdc3')),
      uAtmoCol: u(new THREE.Color('#6ccbc2')), uCloudOff: u(new THREE.Vector2()), uAtmoC: u(new THREE.Vector2(.5, .5)), uAtmoR: u(.3),
    };
    this.quad = new THREE.Mesh(
      new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3))
        .setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2)),
      new THREE.ShaderMaterial({
        uniforms: this.u, depthTest: false, depthWrite: false,
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
        fragmentShader: frag,
      }));
    this.quad.frustumCulled = false;
    this.qs = new THREE.Scene(); this.qs.add(this.quad);
    this.qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
  setSize(w, h, dpr) {
    const W = Math.round(w * dpr), H = Math.round(h * dpr);
    this.rtColor.setSize(W, H); this.rtNormal.setSize(W, H);
    this.u.uRes.value.set(W, H); this.u.uAspect.value = W / H;
    this.u.uThick.value = 3.2 * THREE.MathUtils.clamp(H / 900, 0.7, 1.4);
  }
  render(scene, camera, time) {
    const r = this.r;
    this.u.uNear.value = camera.near; this.u.uFar.value = camera.far; this.u.uTime.value = time;
    r.setRenderTarget(this.rtColor); r.setClearColor(0x000000, 0); r.clear(); r.render(scene, camera);
    const hidden = [];
    scene.traverse((o) => { if (o.userData.noInk && o.visible) { o.visible = false; hidden.push(o); } });
    scene.overrideMaterial = this.normalMat;
    r.setRenderTarget(this.rtNormal); r.clear(); r.render(scene, camera);
    scene.overrideMaterial = null; hidden.forEach((o) => (o.visible = true));
    r.setRenderTarget(null); r.render(this.qs, this.qc);
  }
}
