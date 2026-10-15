/**
 * topo.js - topographic contour shader (the only WebGL in the site).
 *
 * Idea: a 3D simplex-noise field (x, y, time) -> scale to N "levels" -> the level
 * boundaries are the contour lines (fract/step + fwidth for a crisp 1px line), the
 * level index picks a flat fill shade. Cursor distortion = a radial bump added to the
 * noise value, which makes concentric rings appear around the pointer.
 *
 * One fixed full-screen canvas lives behind the whole page. A DOM element
 * (`rectEl`, the hero "frame") is read every frame: INSIDE it the hero palette
 * (filled light blobs) is drawn, OUTSIDE it the themed line-only palette. Scrolling,
 * shrinking or moving that element therefore moves the shader mask - no extra canvas.
 * Colours are plain uniforms, so GSAP can tween the theme (dark green -> cream ...).
 */
import * as THREE from 'three';

// the shader writes raw sRGB values, so hex colours must NOT be converted to linear:
// parse them as LinearSRGB (= no conversion)
export const rawColor = (hex) => new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace);

const vert = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = /* glsl */ `
  precision highp float;
  uniform vec2  uRes;       // canvas size in device px
  uniform float uTime;
  uniform vec2  uMouse;     // device px, y flipped (GL space)
  uniform float uMouseAmp;  // 0..1 distortion strength (eased in JS)
  uniform float uPulse;     // tap ripple 0..1 (mobile)
  uniform vec4  uRect;      // frame rect: x, y(from bottom), w, h in device px
  uniform float uInside;    // 1 = draw hero palette inside the rect
  uniform vec3  uBg;        // outside background
  uniform vec3  uLine;      // outside line colour
  uniform sampler2D uSil;   // head + helmet silhouette (blurred, alpha in .r)
  uniform float uDensity;   // contour levels outside the rect

  // --- 3D simplex noise (Gustavson / McEwan, MIT) -------------------------------
  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // two octaves are enough for soft, map-like blobs
  float field(vec2 p, float t){
    return snoise(vec3(p, t)) * 0.75 + snoise(vec3(p * 2.1 + 7.3, t * 1.4)) * 0.25;
  }

  void main(){
    vec2 frag = gl_FragCoord.xy;
    float unit = min(uRes.x, uRes.y);
    vec2 p = (frag - 0.5 * uRes) / unit;         // resolution independent coords

    // cursor: radial bump (+ a ring wobble) added to the field -> rings around pointer
    vec2 m = (uMouse - 0.5 * uRes) / unit;
    float r = length(p - m);
    float bump = exp(-r * r * 18.0) * uMouseAmp;
    bump += exp(-pow(r - 0.35 * uPulse, 2.0) * 160.0) * uPulse * 0.35;

    float f = field(p * 1.35, uTime) + bump * 0.9;   // roughly -1..1
    float v = f * 0.5 + 0.5;

    // ---------- inside the frame: hero palette (soft filled blobs + visible contour lines) ----------
    float lv = v * 6.0;
    float id = floor(lv);
    float shade = mod(id, 3.0);                      // 0,1,2 -> three flat fills
    vec3 heroBg = vec3(0.988, 0.988, 0.980);         // #fcfcfa
    vec3 fill = shade < 0.5 ? heroBg
              : shade < 1.5 ? vec3(0.918, 0.922, 0.898)   // #eaebe5
                            : vec3(0.961, 0.965, 0.945);  // #f5f6f1
    // silhouette: a head + helmet shape, displaced away from the cursor (radius ~.25 of the viewport),
    // darkens the fill by ~.08 luminance where it sits.
    vec2 sp = p;
    vec2 dm = p - m;
    sp += normalize(dm + 1e-4) * exp(-dot(dm, dm) / 0.0625) * 0.07 * uMouseAmp;
    vec2 suv = sp / 0.78 + 0.5;
    float sil = texture2D(uSil, suv).r * step(0.0, suv.x) * step(suv.x, 1.0) * step(0.0, suv.y) * step(suv.y, 1.0);
    // wobble the edge with the same noise so it reads as another contour band
    sil = smoothstep(0.42, 0.58, sil + (v - 0.5) * 0.12);
    fill -= 0.08 * sil;
    float dh = min(fract(lv), 1.0 - fract(lv)) / fwidth(lv);
    float hLine = 1.0 - smoothstep(0.35, 1.35, dh);                 // ~1px line on every level
    vec3 heroCol = mix(fill, vec3(0.80, 0.82, 0.75), hLine * 0.85);

    // ---------- outside the frame: themed contour lines only ----------
    float lo = v * uDensity;
    float d = min(fract(lo), 1.0 - fract(lo)) / fwidth(lo);
    float line = 1.0 - smoothstep(0.0, 1.3, d);
    vec3 outCol = mix(uBg, uLine, line);

    // rect mask (with a 1px AA edge)
    vec2 rc = uRect.xy + 0.5 * uRect.zw;
    vec2 q = abs(frag - rc) - 0.5 * uRect.zw;
    float inRect = (1.0 - smoothstep(-1.0, 1.0, max(q.x, q.y))) * uInside;

    gl_FragColor = vec4(mix(outCol, heroCol, inRect), 1.0);
  }
`;

/**
 * Procedural silhouette: a racing helmet next to a head in profile, plus shoulders, drawn into a
 * 2D canvas and blurred. Placeholder for a thresholded portrait photo (swap in an <img> the same way).
 */
function silhouetteTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 512, 512);
  g.filter = 'blur(10px)';
  g.fillStyle = '#fff';
  g.beginPath(); g.ellipse(190, 235, 92, 100, 0, 0, Math.PI * 2); g.fill();            // helmet dome
  g.fillRect(150, 280, 110, 30);                                                         // chin guard
  g.beginPath(); g.ellipse(335, 215, 62, 82, 0.1, 0, Math.PI * 2); g.fill();            // head
  g.beginPath(); g.moveTo(300, 280); g.lineTo(380, 280); g.lineTo(395, 340); g.lineTo(300, 340); g.fill();  // neck
  g.beginPath(); g.moveTo(90, 512); g.quadraticCurveTo(110, 350, 260, 340); g.quadraticCurveTo(430, 340, 470, 512); g.fill(); // shoulders
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.flipY = true;
  return tex;
}

export function createTopo(canvas, opts = {}) {
  const {
    reduced = false,
    speed = 0.035,        // time scale of the noise drift
    density = 9,
    rectEl = null,        // DOM element that defines the hero mask (optional)
    bg = '#282c20',
    line = '#3a3f2d',
    maxDpr = 1.5,
  } = opts;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 3.2 },
    uMouse: { value: new THREE.Vector2(-9999, -9999) },
    uMouseAmp: { value: 0 },
    uPulse: { value: 0 },
    uRect: { value: new THREE.Vector4(0, 0, 0, 0) },
    uInside: { value: rectEl ? 1 : 0 },
    uBg: { value: rawColor(bg) },
    uLine: { value: rawColor(line) },
    uSil: { value: silhouetteTexture() },
    uDensity: { value: density },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms });
  mat.extensions = { derivatives: true }; // fwidth (WebGL2 has it natively)
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  let dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w * dpr, h * dpr);
  }
  resize();
  window.addEventListener('resize', resize);
  window.visualViewport?.addEventListener('resize', resize);   // mobile url-bar / tablet rotation

  // ---- pointer: raw target, eased current ----
  const target = { x: -9999, y: -9999, amp: 0 };
  const cur = { x: -9999, y: -9999, amp: 0 };
  if (!reduced) {
    window.addEventListener('pointermove', (e) => {
      target.x = e.clientX; target.y = e.clientY; target.amp = 1;
      if (cur.x < -999) { cur.x = target.x; cur.y = target.y; }
    });
    window.addEventListener('pointerleave', () => (target.amp = 0));
  }

  let visible = true;
  let last = performance.now();

  /** Called from the shared gsap ticker (see scroll.js) - one RAF for the whole site. */
  function render(now = performance.now()) {
    if (!visible) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!reduced) uniforms.uTime.value += dt * speed;     // reduced motion: frozen field

    cur.x += (target.x - cur.x) * 0.08;
    cur.y += (target.y - cur.y) * 0.08;
    cur.amp += (target.amp - cur.amp) * 0.05;
    uniforms.uMouse.value.set(cur.x * dpr, uniforms.uRes.value.y - cur.y * dpr);
    uniforms.uMouseAmp.value = cur.amp * 0.55;

    if (rectEl) {
      const r = rectEl.getBoundingClientRect();
      const H = uniforms.uRes.value.y;
      uniforms.uRect.value.set(r.left * dpr, H - r.bottom * dpr, r.width * dpr, r.height * dpr);
      // the mask is only needed while the frame is on screen
      uniforms.uInside.value = r.bottom > 0 && r.top < window.innerHeight ? 1 : 0;
    }
    renderer.render(scene, camera);
  }

  return {
    uniforms, render, resize,
    setVisible(v) { visible = v; if (v) last = performance.now(); },
    /** Instantly set / tween helpers live in theme.js; this is just the colour handle. */
    pulse() { // tap ripple for touch devices
      uniforms.uPulse.value = 0.001;
      const t0 = performance.now();
      (function step() {
        const k = (performance.now() - t0) / 900;
        uniforms.uPulse.value = k >= 1 ? 0 : k * (1 - k) * 4;
        if (k < 1) requestAnimationFrame(step);
      })();
    },
  };
}
