/*
 * stage.js - the single full-screen WebGL pass (Three.js, one ShaderMaterial, no
 * post-processing). Composes the GLSL chunks of fx/*: background photo (+grain) ->
 * ripples (UV push + glow) -> court lines (overlay blend) -> iris reveal on top.
 * DOM (paddles, ball, digits, type) sits above this canvas.
 */
import * as THREE from 'three'
import gsap from 'gsap'
import { GLSL_BG, IMAGES, FALLBACK_PALETTES } from './fx/background.js'
import { createLines, GLSL_LINES, MAX_LINES } from './fx/lines.js'
import { createRipples, GLSL_RIPPLES, MAX_RIP } from './fx/ripples.js'
import { createIris, GLSL_IRIS } from './fx/iris.js'
import { reduced } from './scale.js'

const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
${GLSL_BG}
${GLSL_LINES}
${GLSL_RIPPLES}
${GLSL_IRIS}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 off = vec2(0.); float glow = 0.;
  for (int i = 0; i < ${MAX_RIP}; i++) {
    vec2 dir; float w = rippleAt(p, uRip[i], uRes.y, dir);
    off += vec2(dir.x, -dir.y) * w * .012; glow += w;
  }
  vec3 col = background(uv, uRes, off) + glow * .2;
  col = courtLines(col, p);
  col = irisReveal(col, p, uv, uRes);
  gl_FragColor = vec4(col, 1.);
}`

const loader = new THREE.TextureLoader()
const cache = new Map()
function tex(url) {
  if (!cache.has(url)) {
    cache.set(url, loader.loadAsync(url).then((t) => {
      t.minFilter = t.magFilter = THREE.LinearFilter
      t.generateMipmaps = false
      return t
    }))
  }
  return cache.get(url)
}

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' })
  const scene = new THREE.Scene()
  const cam = new THREE.Camera()
  const lines = createLines(), ripples = createRipples(), iris = createIris()
  const V4 = (n) => Array.from({ length: n }, () => new THREE.Vector4())
  const blank = new THREE.DataTexture(new Uint8Array([5, 21, 45, 255]), 1, 1)
  blank.needsUpdate = true
  const u = {
    uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 },
    uBg: { value: blank }, uBg2: { value: blank }, uReveal: { value: blank },
    uBgSize: { value: new THREE.Vector2(1, 1) }, uBg2Size: { value: new THREE.Vector2(1, 1) }, uRevSize: { value: new THREE.Vector2(1, 1) },
    uBgMix: { value: 0 }, uHasBg: { value: 0 }, uHasRev: { value: 0 },
    uPalA: { value: new THREE.Color() }, uPalB: { value: new THREE.Color() }, uPalC: { value: new THREE.Color() },
    uLines: { value: V4(MAX_LINES) }, uLineTh: { value: 1.5 }, uLineAmt: { value: 1 },
    uRip: { value: V4(MAX_RIP) },
    uIrisO: { value: new THREE.Vector2() }, uTilt: { value: new THREE.Vector2() },
    uIrisP: { value: 0 }, uIrisZ: { value: 0 }, uIrisInv: { value: 0 }, uIrisThick: { value: 2.5 }, uIrisOn: { value: 0 }, uIrisWave: { value: reduced ? 0 : 1 },
  }
  const mat = new THREE.ShaderMaterial({
    uniforms: u, fragmentShader: FRAG, depthTest: false, depthWrite: false,
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0., 1.); }',
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
  mesh.frustumCulled = false
  scene.add(mesh)

  let dpr = 1
  function resize(portrait) {
    dpr = Math.min(devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(innerWidth, innerHeight, false)
    u.uRes.value.set(innerWidth * dpr, innerHeight * dpr)
    lines.state.portrait = portrait
    u.uLineTh.value = lines.thickness(dpr)
  }

  const setImg = (slot, size, t) => { u[slot].value = t; u[size].value.set(t.image.width, t.image.height) }
  async function setBg(url, instant = false, idx = 0) {
    if (!url) { // fallback plate: tween the blob palette instead of cross-fading textures
      const pal = FALLBACK_PALETTES[idx % FALLBACK_PALETTES.length]
      ;['uPalA', 'uPalB', 'uPalC'].forEach((k, i) => {
        const c = u[k].value, [r, g, b] = pal[i]
        if (instant) c.setRGB(r, g, b)
        else gsap.to(c, { r, g, b, duration: reduced ? .01 : 1.4, ease: 'power2.inOut' })
      })
      return
    }
    u.uHasBg.value = 1
    const t = await tex(url)
    if (instant) { setImg('uBg', 'uBgSize', t); u.uBgMix.value = 0; return }
    setImg('uBg2', 'uBg2Size', t)
    gsap.killTweensOf(u.uBgMix)
    await gsap.fromTo(u.uBgMix, { value: 0 }, { value: 1, duration: reduced ? .01 : 1.4, ease: 'power2.inOut' }).then()
    setImg('uBg', 'uBgSize', t); u.uBgMix.value = 0
  }
  const setReveal = async (url) => { if (!url) return; setImg('uReveal', 'uRevSize', await tex(url)); u.uHasRev.value = 1 }
  const preload = (urls) => Promise.all(urls.filter(Boolean).map(tex))

  function frame(t) {
    u.uTime.value = t
    lines.fill(u.uLines.value, innerWidth * dpr, innerHeight * dpr, dpr)
    ripples.fill(u.uRip.value, dpr)
    iris.tilt()
    const s = iris.s
    u.uIrisOn.value = s.on; u.uIrisP.value = s.p; u.uIrisZ.value = s.z; u.uIrisInv.value = s.inv; u.uIrisThick.value = s.thick
    u.uIrisO.value.set(s.ox * dpr, s.oy * dpr); u.uTilt.value.set(s.tx, -s.ty)
    renderer.render(scene, cam)
  }
  gsap.ticker.add(frame)
  return { resize, setBg, setReveal, preload, lines, ripples, iris, IMAGES }
}
