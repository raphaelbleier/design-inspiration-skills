/* Technique: one full-screen fragment shader (Three.js, orthographic quad) = the whole backdrop.
   Layers: pale radial glow + fbm mist  ->  black "ink cloud" rectangle whose edge is eaten by fbm
   (white wisps along the rim)  ->  soft dark blob that trails the cursor.
   State {ink, blob, y0, y1} is tweened per section by ScrollTrigger (data-ink / data-blob / data-rect).
   Values: fbm 5 octaves, edge noise amplitude .16, ink rect x .02-.44, blob radius ~.28, max opacity .5, cursor lerp .06. */
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { frameCallbacks, reduced } from './scroll.js';

const frag = /* glsl */ `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse;
uniform float uInk; uniform float uBlob; uniform vec2 uY; uniform vec2 uX;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){ float a = .5, s = 0.; for(int i=0;i<5;i++){ s += a*noise(p); p = p*2.03 + 7.1; a *= .5; } return s; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; uv.y = 1.0 - uv.y;
  float asp = uRes.x / uRes.y; vec2 q = vec2(uv.x * asp, uv.y);
  float t = uTime;
  // mist: radial glow, slow fbm drift
  float glow = exp(-pow(length((uv - vec2(.62, .42)) * vec2(1.0, 1.4)) * 1.7, 2.0));
  vec3 col = mix(vec3(.895, .902, .875), vec3(.955, .957, .945), glow);
  col -= (fbm(q * 1.6 + vec2(t * .02, 0.)) - .5) * .05;
  // ink cloud: rect sdf in aspect space, edge displaced by fbm
  vec2 c = vec2((uX.x + uX.y) * .5 * asp, (uY.x + uY.y) * .5);
  vec2 h = vec2((uX.y - uX.x) * .5 * asp, (uY.y - uY.x) * .5);
  vec2 d2 = abs(q - c) - h;
  float d = length(max(d2, 0.)) + min(max(d2.x, d2.y), 0.);
  float n = fbm(q * vec2(5.5, 7.0) + vec2(0., -t * .05));
  float edge = d + (n - .5) * .15;
  float ink = (1.0 - smoothstep(-.015, .03, edge)) * uInk;
  float rim = smoothstep(-.12, .0, edge) * (1. - smoothstep(.0, .05, edge));
  float wisp = smoothstep(.52, .72, fbm(q * 5.5 + vec2(t * .04, t * .02)));
  vec3 inkCol = mix(vec3(.012), vec3(.93), wisp * rim * .9);
  col = mix(col, inkCol, ink);
  // cursor blob
  vec2 m = (uv - uMouse) * vec2(asp, 1.0);
  float streak = fbm(vec2(q.x * 1.6, q.y * 7.0) + vec2(t * .03, 0.));
  float wide = smoothstep(.25, .75, uv.x) * smoothstep(1.0, .35, uv.y);
  float b = (exp(-pow(length(m) * 3.4, 2.0)) * 1.1 + wide * .55) * (.35 + 1.1 * streak) * uBlob;
  col = mix(col, vec3(.2), clamp(b, 0., .6));
  gl_FragColor = vec4(col, 1.0);
}`;

export function initFog() {
  const canvas = document.getElementById('fog');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const u = {
    uRes: { value: new THREE.Vector2() }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(.5, .5) },
    uInk: { value: 0 }, uBlob: { value: 0 }, uY: { value: new THREE.Vector2(.25, .78) }, uX: { value: new THREE.Vector2(.02, .44) },
  };
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: u, fragmentShader: frag,
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0., 1.); }' })));

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    u.uRes.value.set(canvas.width, canvas.height);
    // narrow screens: the ink panel gets wider so text still sits on it
    const narrow = innerWidth < 900;
    gsap.set(u.uX.value, { x: .02, y: innerWidth < 600 ? .98 : narrow ? .74 : .44 });
    render();
  };

  // per-section state: tween the uniforms toward the section's data attributes
  document.querySelectorAll('[data-ink]').forEach((sec) => {
    const [y0, y1] = (sec.dataset.rect || '.25,.78').split(',').map(Number);
    const go = () => {
      const narrow = innerWidth < 900;
      gsap.to(u.uInk, { value: +sec.dataset.ink, duration: 1.2, ease: 'power2.inOut' });
      gsap.to(u.uBlob, { value: narrow ? 0 : +sec.dataset.blob, duration: 1.4, ease: 'power2.inOut' });
      if (sec.dataset.ink === '1') gsap.to(u.uY.value, { x: y0, y: y1, duration: 1.4, ease: 'power3.out' });
    };
    ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onEnter: go, onEnterBack: go });
  });

  // viaduct strip (fixed, bottom-middle) shows only from the FAQ to the end of the page
  const via = document.querySelector('.viaduct');
  ScrollTrigger.create({ trigger: '#faq', start: 'top 60%', endTrigger: 'footer', end: 'bottom bottom', toggleClass: { targets: via, className: 'is-on' } });

  const target = { x: .5, y: .5 };
  addEventListener('pointermove', (e) => { target.x = e.clientX / innerWidth; target.y = e.clientY / innerHeight; });

  function render() { renderer.render(scene, cam); }
  frameCallbacks.add((time) => {
    if (!reduced) u.uTime.value = time;
    u.uMouse.value.x += (target.x - u.uMouse.value.x) * .06;
    u.uMouse.value.y += (target.y - u.uMouse.value.y) * .06;
    render();
  });
  addEventListener('resize', resize);
  resize();
}
