/* CRT screen material. Dark warm field with sparse stars, one horizontal light "voice bar"
   whose length follows uLevel (talking amplitude), chromatic split (R/B offset .004 + level*.01),
   scanlines sin(y*240)*.05, barrel curve, vignette, and a glitch pulse (uGlitch) that tears rows. */
import * as THREE from 'three';

export const screenMaterial = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uLevel: { value: 0 }, uGlitch: { value: 0 } },
  vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
  fragmentShader: /* glsl */`
    varying vec2 vUv; uniform float uTime, uLevel, uGlitch;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    vec3 scene(vec2 uv){
      vec3 c = vec3(.035, .028, .022);
      vec2 g = floor(uv * vec2(90., 60.));
      float star = step(.992, h(g)) * (.5 + .5 * sin(uTime * 2. + h(g + 3.) * 20.));
      c += star * .6;
      float y = .42 + sin(uTime * .7) * .01;
      float len = .1 + uLevel * .62 + .03 * sin(uTime * 9.) * uLevel;
      float bar = smoothstep(.022, .0, abs(uv.y - y)) * smoothstep(.07, .1, uv.x) * smoothstep(.1 + len + .05, .1 + len - .02, uv.x);
      float halo = smoothstep(.16, .0, abs(uv.y - y)) * .18 * step(.07, uv.x) * smoothstep(.1 + len + .15, .1 + len, uv.x);
      c += vec3(.75, .8, 1.) * bar + vec3(.3, .4, .9) * halo;
      return c;
    }
    void main(){
      vec2 uv = vUv, d = uv - .5;
      uv = .5 + d * (1. + dot(d, d) * .25);                         // barrel
      float tear = step(.93, h(vec2(floor(uv.y * 40.), floor(uTime * 12.)))) * uGlitch;
      uv.x += tear * .06;
      float s = .004 + uLevel * .01 + uGlitch * .02;
      vec3 col = vec3(scene(uv + vec2(s, 0.)).r, scene(uv).g, scene(uv - vec2(s, 0.)).b);
      col *= .94 + .06 * sin(uv.y * 240. + uTime * 2.);              // scanlines
      col += (h(uv * 400. + uTime) - .5) * .05;                      // grain
      col *= smoothstep(.75, .25, length(vUv - .5));                 // vignette
      gl_FragColor = vec4(col, 1.);
    }`,
});
