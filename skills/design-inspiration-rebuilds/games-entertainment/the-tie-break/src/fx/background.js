/*
 * background.js - full-screen photo layer (GLSL chunk + image lists).
 *
 * The original bakes a blurred, grainy lookbook photo into KTX2 textures. Here the
 * images are pre-blurred (Gaussian) at build time and the grain is added live:
 *   grain = (hash(pixel, floor(time*12)) - .5) * .11
 * Two textures are cross-faded with uBgMix after every point. A 4% over-scale with a
 * slow sine drift (period ~ 60s, +-0.8%) keeps the plate alive without parallax.
 * Cover-fit is done in the shader (coverUV) so any aspect works.
 */
const glob = import.meta.glob('../assets/*.webp', { eager: true, query: '?url', import: 'default' })
const url = (n) => glob[`../assets/${n}.webp`]
const have = (l) => l.filter(Boolean) // a missing slot degrades to the plain navy plate

export const IMAGES = {
  bg: { land: have(['bg1', 'bg2', 'bg3', 'bg4'].map(url)), port: have(['bgp1', 'bgp2'].map(url)) },
  rv: { land: have(['rv1', 'rv2', 'rv3', 'rv4'].map(url)), port: have(['rvp1', 'rvp2'].map(url)) },
}

export const GLSL_BG = /* glsl */ `
uniform sampler2D uBg, uBg2, uReveal;
uniform vec2 uBgSize, uBg2Size, uRevSize;
uniform float uBgMix, uTime;
vec2 coverUV(vec2 uv, vec2 img, vec2 res){
  float ra = res.x / res.y, ia = img.x / img.y;
  vec2 s = ra > ia ? vec2(1., ia / ra) : vec2(ra / ia, 1.);
  return (uv - .5) * s + .5;
}
float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
uniform float uHasBg, uHasRev;
uniform vec3 uPalA, uPalB, uPalC;
// Fallback when no photo slot is available: three drifting soft blobs in the palette
// of the lookbook plates (cobalt / cream / crimson). Not used when the images exist.
vec3 blobField(vec2 uv, vec2 res){
  vec2 q = (uv - .5) * vec2(res.x / res.y, 1.);
  float t = uTime * .05;
  float b1 = exp(-dot(q - vec2(-.35 + .12 * sin(t), .05), q - vec2(-.35 + .12 * sin(t), .05)) * 4.);
  float b2 = exp(-dot(q - vec2(.4 + .1 * cos(t * .9), -.1 + .1 * sin(t)), q - vec2(.4 + .1 * cos(t * .9), -.1 + .1 * sin(t))) * 5.);
  float b3 = exp(-dot(q - vec2(.0, -.45 + .05 * sin(t * 1.3)), q - vec2(.0, -.45 + .05 * sin(t * 1.3))) * 9.);
  return mix(mix(mix(uPalA, uPalB, b1 * .9), uPalB, b2 * .7), uPalC, b3 * .8);
}
vec3 background(vec2 uv, vec2 res, vec2 off){
  vec2 d = vec2(sin(uTime * .1), cos(uTime * .08)) * .008;
  vec2 u = (uv - .5) / 1.04 + .5 + d + off;
  vec3 c;
  if (uHasBg > .5) {
    // 13-tap disc blur on top of the pre-blurred plates (the original is far softer), then a
    // desaturating navy veil so white type reads on cream/white photo areas.
    vec2 r = vec2(.018 * res.y / res.x, .018);
    c = vec3(0.);
    for (int i = 0; i < 12; i++) {
      float a = float(i) * .5236, k = i < 6 ? 1. : .5;
      vec2 o = vec2(cos(a), sin(a)) * r * k;
      c += mix(texture2D(uBg, coverUV(u + o, uBgSize, res)).rgb, texture2D(uBg2, coverUV(u + o, uBg2Size, res)).rgb, uBgMix);
    }
    c = (c + mix(texture2D(uBg, coverUV(u, uBgSize, res)).rgb, texture2D(uBg2, coverUV(u, uBg2Size, res)).rgb, uBgMix)) / 13.;
    c = mix(vec3(dot(c, vec3(.3, .59, .11))), c, .7) * .62;
    c = mix(c, vec3(.05, .12, .3), .28);
  } else c = blobField(u, res);
  float g = hash(gl_FragCoord.xy + floor(uTime * 12.) * 17.3) - .5;
  return c + g * .11;
}
`

// palette sets (linear-ish sRGB) used by the blob fallback, one per background slot
export const FALLBACK_PALETTES = [
  [[.16, .30, .62], [.74, .75, .74], [.42, .10, .14]],
  [[.12, .22, .50], [.80, .78, .72], [.58, .13, .15]],
  [[.40, .44, .55], [.72, .74, .80], [.20, .26, .50]],
  [[.38, .41, .47], [.78, .78, .76], [.30, .33, .40]],
]
