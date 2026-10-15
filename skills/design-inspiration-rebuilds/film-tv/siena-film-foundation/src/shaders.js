/*
 * SHADERS (GLSL ES 3 via OGL, WebGL2)
 * -----------------------------------
 * Every DOM image is replaced by a plane whose screen rectangle is driven from JS in CSS pixels (u_rect), so
 * DOM layout stays the source of truth (SEO, a11y, resize) while the GL layer adds the look.
 *
 *  card vertex     rect (px, y-down) -> clip space. One vertex shader for every mesh type.
 *  home fragment   rounded "arch" mask from an SDF with a hand-cut wobble, cover-fit UVs with 1.18 zoom,
 *                  parallax (uv.y shifted by offset*0.07), vertical gradient smoothstep(.5,.1,|y-.5|),
 *                  colour-dodge gold tint in the top-left corner, vertical speed blur, dimming for non-active slides.
 *  work fragment   same mask (radius 14px) + 9-tap gaussian (offsets 1.41/3.29/5.18, weights .196/.297/.094/.010)
 *                  run on x AND y: radius = (1-focus)*14px + |speed|*18px, darkened by distance from centre.
 *  still fragment  footage-mode tiles: square crops with inner vignette, blur/dim by distance from screen centre.
 *  post fragment   full-screen pass: barrel bulge (0.1), animated film grain (0.07), speed-scaled glow
 *                  ("film_power" 0.5) and a soft vertical blur at the top/bottom screen edges, then page alpha.
 */
export const vertex = /* glsl */ `#version 300 es
in vec2 uv; in vec3 position;
uniform vec4 u_rect; uniform vec2 u_res;
out vec2 v_uv;
void main() {
  v_uv = uv;
  // plane position.y = +0.5 is the top edge; screen y is flipped so the image is upright
  vec2 p = u_rect.xy + vec2(position.x + .5, .5 - position.y) * u_rect.zw;
  vec2 c = p / u_res * 2. - 1.;
  gl_Position = vec4(c.x, -c.y, 0., 1.);
}`;

const common = /* glsl */ `
precision highp float;
in vec2 v_uv; out vec4 outColor;
uniform sampler2D u_tex; uniform vec2 u_size; uniform vec2 u_img; uniform float u_alpha; uniform float u_time;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float sdRoundBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }
// object-fit: cover with an extra zoom factor
vec2 coverUV(vec2 uv, vec2 size, vec2 img, float zoom){
  float rs = size.x / size.y, ri = img.x / img.y;
  vec2 s = rs > ri ? vec2(1., ri / rs) : vec2(rs / ri, 1.);
  return (uv - .5) * s / zoom + .5;
}
float mask(float radius, float wobble){
  vec2 p = (v_uv - .5) * u_size;
  float w = (vnoise(v_uv * vec2(6., 4.) + 3.) - .5) * wobble;     // hand-cut edge
  return 1. - smoothstep(-1., 1., sdRoundBox(p, u_size * .5, radius) + w);
}
// 9-tap gaussian (5 texture reads), offsets/weights from the original's blur13
vec3 blur9(sampler2D t, vec2 uv, vec2 dir){
  vec3 c = texture(t, uv).rgb * .1964825501511404;
  c += (texture(t, uv + dir * 1.411764705882353).rgb + texture(t, uv - dir * 1.411764705882353).rgb) * .2969069646728344;
  c += (texture(t, uv + dir * 3.2941176470588234).rgb + texture(t, uv - dir * 3.2941176470588234).rgb) * .09447039785044732;
  c += (texture(t, uv + dir * 5.176470588235294).rgb + texture(t, uv - dir * 5.176470588235294).rgb) * .010381362401148057;
  return c;
}`;

export const homeFragment = /* glsl */ `#version 300 es
${common}
uniform float u_offset;   // slide position relative to centre, in slides (-1..1 visible)
uniform float u_speed;    // smoothed roll speed 0..1
void main(){
  vec2 uv = coverUV(v_uv, u_size, u_img, 1.1);
  uv.y -= clamp(u_offset, -1.5, 1.5) * .07;                       // parallax
  vec2 d = vec2(0., (.5 + u_speed * 7.) / u_size.y);              // vertical motion blur
  vec3 col = blur9(u_tex, uv, d);
  float grad = smoothstep(.5, .1, abs(v_uv.y - .5));              // v_grad: darkens top and bottom
  col *= mix(.58, 1., grad);
  col *= 1. - smoothstep(0., 1., abs(u_offset)) * .55;            // neighbours peek in darker
  float g = 1. - smoothstep(0., .9, length(v_uv - vec2(0., 1.)));  // gold colour-dodge, top-left
  vec3 gold = vec3(1., .86, 0.);
  col = mix(col, col / max(vec3(1.) - gold * g * .3, .05), .65);
  col *= 1. - .35 * smoothstep(.45, .95, length((v_uv - .5) * vec2(1.4, 1.)));   // vignette
  outColor = vec4(col, mask(40., 5.) * u_alpha);
}`;

export const workFragment = /* glsl */ `#version 300 es
${common}
uniform float u_focus;    // 1 at centre -> 0 far away (smoothstep(1.5,0,|offset|))
uniform float u_speed;    // signed roll speed
void main(){
  vec2 uv = coverUV(v_uv, u_size, u_img, 1.06);
  float r = (1. - u_focus) * 14. + abs(u_speed) * 18.;
  vec3 col = .5 * (blur9(u_tex, uv, vec2(r / u_size.x, 0.)) + blur9(u_tex, uv, vec2(0., (1. - u_focus) * 10. / u_size.y)));
  col *= mix(.34, 1., u_focus);
  col *= mix(.45, 1., smoothstep(.15, .5, v_uv.y));               // bottom gradient behind the title
  col *= 1. - .3 * smoothstep(.5, 1., length((v_uv - .5) * vec2(1.5, 1.)));
  outColor = vec4(col, mask(14., 3.) * u_alpha);
}`;

export const stillFragment = /* glsl */ `#version 300 es
${common}
uniform float u_focus; uniform vec2 u_crop; uniform float u_in;
void main(){
  vec2 uv = coverUV(v_uv, u_size, u_img, 1.9) + u_crop;
  float r = (1. - u_focus) * 16.;
  vec3 col = .5 * (blur9(u_tex, uv, vec2(r / u_size.x, 0.)) + blur9(u_tex, uv, vec2(0., r / u_size.y)));
  float vig = smoothstep(.85, .25, length((v_uv - .5) * 1.25));   // soft inner vignette of every tile
  col *= mix(.2, 1., vig) * mix(.25, 1., u_focus);
  outColor = vec4(col, mask(6., 2.) * u_alpha * u_in);
}`;

export const postVertex = /* glsl */ `#version 300 es
in vec2 uv; in vec2 position; out vec2 v_uv;
void main(){ v_uv = uv; gl_Position = vec4(position, 0., 1.); }`;

export const postFragment = /* glsl */ `#version 300 es
precision highp float;
in vec2 v_uv; out vec4 outColor;
uniform sampler2D tMap; uniform vec2 u_res; uniform float u_time, u_speed, u_alpha;
const float BULGE = .1, NOISE = .07, FILM = .5;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + u_time) * 43758.5453); }
void main(){
  vec2 d = v_uv - .5;
  vec2 uv = .5 + d * (1. + BULGE * .1 * dot(d, d));                 // barrel distortion, ~1% at the edges
  float edge = smoothstep(.34, .5, abs(d.y));
  vec3 col = texture(tMap, uv).rgb;
  float px = edge * 5. / u_res.y;                                   // soft vertical blur at top/bottom edges
  col = mix(col, .5 * (texture(tMap, uv + vec2(0., px)).rgb + texture(tMap, uv - vec2(0., px)).rgb), edge);
  vec3 glow = vec3(0.);                                             // speed-scaled glow ("film_power")
  for (int i = 0; i < 6; i++) { float a = float(i) * 1.0472; glow += texture(tMap, uv + vec2(cos(a), sin(a)) * 14. / u_res).rgb; }
  col += glow / 6. * clamp(u_speed, 0., 1.) * FILM * .35;
  col += (hash(v_uv * u_res) - .5) * NOISE * 1.6;                   // animated grain
  outColor = vec4(col * u_alpha, 1.);
}`;
