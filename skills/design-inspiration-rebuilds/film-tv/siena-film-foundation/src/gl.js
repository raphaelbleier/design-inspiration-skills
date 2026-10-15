/*
 * ONE PERSISTENT WEBGL CANVAS (OGL)
 * ---------------------------------
 * The canvas is fixed behind the DOM and never destroyed between pages. Pages add/remove meshes; the router just
 * fades GL.alpha (the post pass multiplies by it). That persistence is why a plain fade between pages feels seamless.
 *
 *   scene -> RenderTarget (dpr <= 2, clear black) -> full-screen triangle with the post shader -> screen
 *
 * Rendering is driven from gsap.ticker (same clock as Lenis and the slide controller).
 */
import { Renderer, Program, Mesh, Plane, Triangle, RenderTarget, Transform, Texture } from 'ogl';
import { vertex, postVertex, postFragment } from './shaders.js';

const state = { ok: false, w: 1, h: 1, res: [1, 1], alpha: 1, speed: 0 };
let renderer, gl, scene, target, post, postMesh, plane;
const textures = new Map();
const meshes = new Set();

export const GL = {
  get ok() { return state.ok; },
  get state() { return state; },

  init(wrap) {
    try {
      const canvas = wrap.querySelector('canvas');
      renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: false, antialias: false, webgl: 2 });
      gl = renderer.gl;
      if (!gl || !gl.createVertexArray) throw new Error('no webgl2');
    } catch (e) {
      document.documentElement.classList.add('no-gl');
      return false;
    }
    gl.clearColor(0, 0, 0, 1);
    scene = new Transform();
    plane = new Plane(gl, { width: 1, height: 1 });
    target = new RenderTarget(gl, { color: 1, depth: false });
    post = new Program(gl, {
      vertex: postVertex, fragment: postFragment,
      uniforms: { tMap: { value: target.texture }, u_res: { value: [1, 1] }, u_time: { value: 0 }, u_speed: { value: 0 }, u_alpha: { value: 1 } },
    });
    postMesh = new Mesh(gl, { geometry: new Triangle(gl), program: post });
    state.ok = true;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    return true;
  },

  resize() {
    if (!state.ok) return;
    state.w = window.innerWidth; state.h = window.innerHeight;
    state.res[0] = state.w; state.res[1] = state.h;
    renderer.setSize(state.w, state.h);
    target.setSize(state.w * renderer.dpr, state.h * renderer.dpr);
    post.uniforms.u_res.value = [state.w * renderer.dpr, state.h * renderer.dpr];
  },

  texture(url) {
    if (textures.has(url)) return textures.get(url);
    const tex = new Texture(gl, { generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
    const entry = { tex, w: 1, h: 1, ready: false, waiters: [] };
    const im = new Image();
    im.onload = () => { tex.image = im; entry.w = im.naturalWidth; entry.h = im.naturalHeight; entry.ready = true; entry.waiters.forEach((f) => f(entry)); };
    im.src = url;
    textures.set(url, entry);
    return entry;
  },

  /** Create a rect-driven mesh. `extra` uniforms are merged in. Returns { rect, u, mesh, set(), destroy() }. */
  mesh(url, fragment, extra = {}) {
    const entry = this.texture(url);
    const rect = [0, 0, 1, 1];
    const program = new Program(gl, {
      vertex, fragment, transparent: true, depthTest: false, depthWrite: false, cullFace: false,
      uniforms: {
        u_tex: { value: entry.tex }, u_rect: { value: rect }, u_res: { value: state.res }, u_size: { value: [1, 1] },
        u_img: { value: [1, 1] }, u_alpha: { value: 1 }, u_time: { value: 0 }, ...extra,
      },
    });
    const mesh = new Mesh(gl, { geometry: plane, program });
    mesh.visible = false;
    mesh.setParent(scene);
    const h = {
      rect, u: program.uniforms, mesh, program, entry,
      /** x,y = top-left in CSS px */
      set(x, y, w, hh) {
        rect[0] = x; rect[1] = y; rect[2] = w; rect[3] = hh;
        program.uniforms.u_size.value[0] = w; program.uniforms.u_size.value[1] = hh;
        mesh.visible = entry.ready && w > 1 && hh > 1 && y < state.h + 2 && y + hh > -2 && x < state.w + 2 && x + w > -2 && program.uniforms.u_alpha.value > 0.001;
      },
      destroy() { mesh.setParent(null); meshes.delete(h); program.remove(); },
    };
    const sync = (e) => { h.u.u_img.value = [e.w, e.h]; };
    if (entry.ready) sync(entry); else entry.waiters.push(sync);
    meshes.add(h);
    return h;
  },

  render(time) {
    if (!state.ok) return;
    post.uniforms.u_time.value = time % 100;
    post.uniforms.u_speed.value = state.speed;
    post.uniforms.u_alpha.value = state.alpha;
    meshes.forEach((m) => { m.u.u_time.value = time; });
    renderer.render({ scene, target });
    renderer.render({ scene: postMesh });
  },
};
