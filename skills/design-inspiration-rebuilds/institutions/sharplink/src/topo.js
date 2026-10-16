// Fixed full-screen contour field behind the page (Three.js full-screen triangle, GLSL).
// Value noise -> fract/step bands, ~1.4px lines via fwidth, rounded "pipe" look by squaring the band.
// Colours lerp (uTheme 0 dark navy -> 1 pale sky) with scroll; cursor adds a radial bump.
import * as THREE from 'three';
export const topo = { theme: 0, mx: 0.5, my: 0.5 };
export function initTopo(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const u = { uT: { value: 0 }, uTheme: { value: 0 }, uRes: { value: new THREE.Vector2() }, uM: { value: new THREE.Vector2(.5, .5) } };
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: u, depthTest: false,
    vertexShader: 'varying vec2 v;void main(){v=uv;gl_Position=vec4(position,1.);}',
    fragmentShader: `precision highp float;varying vec2 v;uniform float uT,uTheme;uniform vec2 uRes,uM;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
      void main(){
        vec2 p=(v-.5)*vec2(uRes.x/uRes.y,1.);
        float d=length(p-(uM-.5)*vec2(uRes.x/uRes.y,1.));
        float f=n(p*2.2+vec2(uT*.03,0.))*.65+n(p*4.4-uT*.02)*.35+exp(-d*d*10.)*.25;
        float lo=f*9.;
        float e=min(fract(lo),1.-fract(lo))/fwidth(lo);
        float line=1.-smoothstep(0.,2.2,e);
        float fall=smoothstep(.0,1.,v.y);                       // fade to the lower edge, like the hero
        vec3 darkBg=mix(vec3(.02,.03,.05),vec3(.05,.2,.45),pow(1.-v.y,1.6)*.9);
        vec3 lightBg=mix(vec3(.97,.97,.95),vec3(.76,.83,.93),pow(v.y,1.2));
        vec3 bg=mix(darkBg,lightBg,uTheme);
        vec3 ln=mix(vec3(.25,.4,.65),vec3(.8,.87,.96),uTheme);
        gl_FragColor=vec4(mix(bg,ln,line*.35*fall*(1.-uTheme*.6)),1.);
      }`
  })));
  const size = () => { r.setSize(innerWidth, innerHeight, false); u.uRes.value.set(canvas.width, canvas.height); };
  size(); addEventListener('resize', size);
  addEventListener('pointermove', (e) => { topo.mx = e.clientX / innerWidth; topo.my = 1 - e.clientY / innerHeight; });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (t) => {
    u.uT.value = reduce ? 0 : t;
    u.uTheme.value += (topo.theme - u.uTheme.value) * 0.08;
    u.uM.value.x += (topo.mx - u.uM.value.x) * 0.06; u.uM.value.y += (topo.my - u.uM.value.y) * 0.06;
    r.render(scene, cam);
  };
}
