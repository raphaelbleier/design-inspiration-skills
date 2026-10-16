// Post: chromatic aberration (RGB split grows with radius and with scroll velocity) + film grain + vignette.
// Values: base split .0016, +velocity * .02 (clamped), grain .028.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const CA = {
  uniforms: { tDiffuse: { value: null }, uSplit: { value: 0.0016 }, uTime: { value: 0 } },
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse; uniform float uSplit, uTime; varying vec2 vUv;
    float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uTime)*43758.5453);}
    void main(){
      vec2 d = vUv - .5;
      float k = uSplit * (.4 + dot(d,d) * 6.);          // split grows toward the edges
      float r = texture2D(tDiffuse, vUv + d * k).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - d * k).b;
      vec3 c = vec3(r,g,b);
      c += (h(vUv * 900.) - .5) * .028;                // grain
      c *= 1. - dot(d,d) * .9;                          // vignette
      gl_FragColor = vec4(c, 1.);
    }`
};

export function makePost(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const ca = new ShaderPass(CA);
  composer.addPass(ca);
  composer.addPass(new OutputPass());
  return { composer, ca };
}
