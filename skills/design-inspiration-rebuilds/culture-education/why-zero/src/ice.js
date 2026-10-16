/* Full-screen ice shader (Three.js, one triangle, ortho cam).
 * - Voronoi cell edges warped by fbm = cracked ice; edge width ~ fwidth-free smoothstep(0, .06).
 * - uTemp 0..1 drives the frost line: frost covers y > 1.3*uTemp - .15 (noisy edge), below it a
 *   flat teal -> mint vertical gradient (the "thawed" water).
 * - uTrail: CanvasTexture holding the cursor trail; brightens and warps the ice (draw.js).
 * - uBurst: 1 -> 0 flash when a zero is closed. */
import * as THREE from 'three';

const frag = /* glsl */`
precision highp float;
uniform vec2 uRes; uniform float uTime, uTemp, uBurst; uniform sampler2D uTrail;
varying vec2 vUv;
vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h2(i).x,h2(i+vec2(1,0)).x,f.x),mix(h2(i+vec2(0,1)).x,h2(i+vec2(1,1)).x,f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p*=2.02;a*=.5;}return s;}
vec2 vor(vec2 p){ // x = distance to nearest edge
  vec2 g=floor(p),f=fract(p);float md=8.;vec2 mr;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 b=vec2(x,y);vec2 r=b+h2(g+b)*.9-f;float d=dot(r,r);if(d<md){md=d;mr=r;}}
  float ed=8.;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 b=vec2(x,y);vec2 r=b+h2(g+b)*.9-f;
    if(dot(mr-r,mr-r)>1e-4)ed=min(ed,dot(.5*(mr+r),normalize(r-mr)));}
  return vec2(ed,md);
}
void main(){
  vec2 uv=vUv; float asp=uRes.x/uRes.y; vec2 p=vec2(uv.x*asp,uv.y);
  float t=texture2D(uTrail,uv).r;
  vec2 w=p*5.+vec2(fbm(p*2.+uTime*.03),fbm(p*2.+7.))*.9 + t*.25;
  vec2 v=vor(w);
  float crack=1.-smoothstep(0.,.07+t*.05,v.x);
  float mottled=fbm(p*9.+uTime*.02);
  float frostLine=-.15+1.3*uTemp+(fbm(p*4.)-.5)*.35;
  float frost=smoothstep(frostLine-.04,frostLine+.04,uv.y);
  vec3 deep=vec3(.18,.56,.46), mint=vec3(.78,.94,.88);
  vec3 water=mix(deep,mint,pow(1.-uv.y,2.2)*.9);
  vec3 ice=mix(deep*.85,mint,mottled*.55+.1)+crack*vec3(.75,1.,.9)*(.28+uBurst);
  ice+=t*vec3(.5,.8,.7);
  vec3 col=mix(water,ice,frost);
  col+=uBurst*.25*vec3(.7,1.,.9);
  gl_FragColor=vec4(col,1.);
}`;

export function createIce(canvas, trailCanvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const trailTex = new THREE.CanvasTexture(trailCanvas);
  const u = { uRes: { value: new THREE.Vector2() }, uTime: { value: 0 }, uTemp: { value: 0 },
    uBurst: { value: 0 }, uTrail: { value: trailTex } };
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
  scene.add(new THREE.Mesh(geo, new THREE.ShaderMaterial({
    uniforms: u, depthTest: false,
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: frag })));
  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); renderer.getDrawingBufferSize(u.uRes.value); };
  addEventListener('resize', resize); resize();
  return { u, render(time) { u.uTime.value = time; trailTex.needsUpdate = true; renderer.render(scene, cam); } };
}
