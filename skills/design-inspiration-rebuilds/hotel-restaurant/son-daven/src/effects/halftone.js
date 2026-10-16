/*
 * VERTICAL-BAR HALFTONE: the signature effect, one small WebGL1 fragment shader.
 *
 * One <canvas> per scene. Each scene holds N layers (an <img>, <canvas> or looping
 * <video> uploaded as a texture); every layer is one full-screen-quad draw with its
 * own `cfg` object. Animate a scene by tweening the cfg object itself:
 *     gsap.to(layer.cfg, { blackPoint: 45, whitePoint: 175, scrollTrigger: ... })
 * The render loop sees the change and redraws; nothing else is wired.
 *
 * PER-PIXEL LOGIC
 *  1. Clip to the layer bounds (cfg.x/y/w/h as fractions of the canvas; may exceed 0..1
 *     so a layer can zoom past the frame).
 *  2. Quantise to a grid of xSquares x ySquares cells over the bounds, sample the
 *     texture (object-fit: cover) at the cell centre.
 *  3. Discard if the cell centre is transparent, or if any texel in the 5x5 block
 *     (+-2 texels) is (only when cfg.alpha=1, to save 25 fetches/px): this trims the
 *     ragged edge of alpha cut-outs. Optional:
 *     dropBlack discards pure-black cells.
 *  4. Gamma, then levels:  rgb = clamp((rgb*255 - blackPoint) / (whitePoint - blackPoint), 0, 1)
 *  5. br = dot(rgb, vec3(0.333)) * alpha.  If br > threshold/255 -> background colour.
 *  6. Otherwise draw a vertical bar centred in the cell, width = mix(maxW, minW, br)
 *     (defaults 1.02 / -0.02 of the cell): DARK pixels give WIDE bars, BRIGHT pixels
 *     give thin ones. Inside the bar = fill colour, outside = background colour.
 *  The shader reads brightness only, so sources need strong luminance contrast.
 *
 * COLOUR   bg / fill are CSS custom-property names ('--sand') or hex; bgOpacity 0 makes
 *          the effect float over the page as pure fill bars.
 * CONTEXT  WebGL1, alpha:true, antialias:false, premultipliedAlpha:false,
 *          powerPreference:'high-performance', DPR capped at 1.5.
 * BUDGET   draws only while in view (IntersectionObserver, rootMargin 20%), capped at
 *          60fps, and only when the config changed (or a video source is playing).
 *
 * BLOOM TRICK: tween cfg.minW from -0.02 to 1.02 and cfg.threshold to 256 and every
 * cell becomes a full fill block, i.e. the scene "blooms" into a solid colour field.
 */
import { $ } from '../core/dom.js';

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a,0.,1.); }`;
const FRAG = `
precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_canvas, u_grid, u_texSize;
uniform vec4 u_bounds, u_bg, u_fill;
uniform float u_black, u_white, u_gamma, u_thr, u_minW, u_maxW, u_dropBlack, u_alpha;
void main(){
  vec2 p = vec2(gl_FragCoord.x, u_canvas.y - gl_FragCoord.y);
  vec2 local = (p - u_bounds.xy) / u_bounds.zw;
  if (local.x < 0. || local.y < 0. || local.x > 1. || local.y > 1.) discard;
  vec2 g = local * u_grid;
  vec2 cell = floor(g);
  vec2 inCell = fract(g);
  vec2 c = (cell + .5) / u_grid;
  float ba = u_bounds.z / u_bounds.w, ta = u_texSize.x / u_texSize.y;
  vec2 uv = c;
  if (ba > ta) uv.y = (c.y - .5) * (ta / ba) + .5; else uv.x = (c.x - .5) * (ba / ta) + .5;
  vec4 s = texture2D(u_tex, uv);
  if (s.a < .5) discard;
  if (u_alpha > .5) {
    vec2 tx = 1. / u_texSize;
    for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) {
      if (texture2D(u_tex, uv + vec2(float(i), float(j)) * tx).a < .5) discard;
    }
  }
  if (u_dropBlack > .5 && max(s.r, max(s.g, s.b)) < .004) discard;
  vec3 rgb = pow(s.rgb, vec3(u_gamma));
  rgb = clamp((rgb * 255. - u_black) / max(u_white - u_black, 1.), 0., 1.);
  float br = dot(rgb, vec3(.333)) * s.a;
  vec4 o = u_bg;
  if (br <= u_thr / 255.) {
    float w = mix(u_maxW, u_minW, br);
    if (abs(inCell.x - .5) * 2. <= w) o = u_fill;
  }
  gl_FragColor = o;
}`;

const DEFAULTS = {
  x: 0, y: 0, w: 1, h: 1,
  xSquares: 100, ySquares: 60,
  gamma: 1, blackPoint: 0, whitePoint: 255, threshold: 255,
  minW: -0.02, maxW: 1.02, dropBlack: 0, alpha: 0,
  bg: '--ink', fill: '--sand', bgOpacity: 1, fillOpacity: 1,
};

const scenes = new Set();

function rgba(canvas, c, a) {
  let v = c.startsWith('--') ? getComputedStyle(canvas).getPropertyValue(c).trim() : c;
  if (v.length === 4) v = '#' + [...v.slice(1)].map((h) => h + h).join('');
  const n = parseInt(v.slice(1, 7), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, a];
}

function shader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {Array<{source: TexImageSource, ...cfg}>} layers
 * @returns scene | null (null when WebGL is unavailable: the page stays readable)
 */
export function createHalftone(canvas, layers) {
  const gl = canvas.getContext('webgl', {
    alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'high-performance',
  });
  if (!gl) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const U = (n) => gl.getUniformLocation(prog, n);

  const scene = { canvas, gl, visible: false, last: '', lastT: 0, layers: [] };

  scene.layers = layers.map(({ source, ...cfg }) => {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const layer = { tex, source, cfg: { ...DEFAULTS, ...cfg }, video: source instanceof HTMLVideoElement };
    upload(layer);
    return layer;
  });

  function upload(l) {
    gl.bindTexture(gl.TEXTURE_2D, l.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, l.source);
    l.size = [l.source.naturalWidth || l.source.videoWidth || l.source.width, l.source.naturalHeight || l.source.videoHeight || l.source.height];
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; scene.last = ''; }
  }

  scene.render = (force) => {
    resize();
    const W = canvas.width, H = canvas.height;
    const key = W + 'x' + H + scene.layers.map((l) => Object.values(l.cfg).join()).join('|');
    const live = scene.layers.some((l) => l.video);
    if (!force && !live && key === scene.last) return;
    scene.last = key;
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (const l of scene.layers) {
      const c = l.cfg;
      if (l.video) upload(l);
      gl.bindTexture(gl.TEXTURE_2D, l.tex);
      gl.uniform2f(U('u_canvas'), W, H);
      gl.uniform4f(U('u_bounds'), c.x * W, c.y * H, c.w * W, c.h * H);
      gl.uniform2f(U('u_grid'), c.xSquares, c.ySquares);
      gl.uniform2f(U('u_texSize'), l.size[0], l.size[1]);
      gl.uniform1f(U('u_black'), c.blackPoint);
      gl.uniform1f(U('u_white'), c.whitePoint);
      gl.uniform1f(U('u_gamma'), c.gamma);
      gl.uniform1f(U('u_thr'), c.threshold);
      gl.uniform1f(U('u_minW'), c.minW);
      gl.uniform1f(U('u_maxW'), c.maxW);
      gl.uniform1f(U('u_dropBlack'), c.dropBlack);
      gl.uniform1f(U('u_alpha'), c.alpha);
      gl.uniform4fv(U('u_bg'), rgba(canvas, c.bg, c.bgOpacity));
      gl.uniform4fv(U('u_fill'), rgba(canvas, c.fill, c.fillOpacity));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  };

  // in-view only, 60fps cap
  new IntersectionObserver(([e]) => { scene.visible = e.isIntersecting; if (e.isIntersecting) scene.last = ''; }, { rootMargin: '20%' }).observe(canvas);
  scene.tick = (now) => {
    if (!scene.visible || now - scene.lastT < 16) return;
    scene.lastT = now;
    scene.render();
  };
  scenes.add(scene);
  return scene;
}

let running = false;
export function startHalftoneLoop() {
  if (running) return;
  running = true;
  const loop = (t) => { scenes.forEach((s) => s.tick(t)); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}

/** Decode every <img data-ht-src> / given img and resolve once ready. */
export async function loadImage(el) {
  if (!el.complete) await new Promise((r) => { el.onload = el.onerror = r; });
  try { await el.decode(); } catch { /* ignore */ }
  return el;
}

export const halftoneSource = (sel) => loadImage($(sel));
