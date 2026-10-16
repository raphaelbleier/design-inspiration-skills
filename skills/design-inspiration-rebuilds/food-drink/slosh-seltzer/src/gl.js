/**
 * gl.js - one fixed full-screen canvas above the page (pointer-events: none).
 * Technique: OrthographicCamera in CSS pixels. Every 3D object is positioned from the
 * getBoundingClientRect() of a DOM anchor, so WebGL objects scroll with the page and the
 * layout stays in CSS. RoomEnvironment (PMREM) gives the aluminium its reflections.
 * Renderer: alpha, antialias, pixel ratio capped at 2.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { onFrame } from './scroll.js';

const canvas = document.getElementById('gl');
export const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;

export const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.7;
const sun = new THREE.DirectionalLight(0xffffff, 0.9);
sun.position.set(-300, 600, 900);
scene.add(sun);

export const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -3000, 3000);
camera.position.z = 1000;
export const size = { w: innerWidth, h: innerHeight };

function resize() {
  size.w = innerWidth; size.h = innerHeight;
  renderer.setSize(size.w, size.h, false);
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:10;pointer-events:none';
  Object.assign(camera, { left: -size.w / 2, right: size.w / 2, top: size.h / 2, bottom: -size.h / 2 });
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

/** Put `obj` at the centre of a DOM element (pixels, y up). Returns the rect. */
export function place(obj, el, dx = 0, dy = 0) {
  const r = el.getBoundingClientRect();
  obj.position.set(r.left + r.width / 2 - size.w / 2 + dx, size.h / 2 - (r.top + r.height / 2) - dy, 0);
  return r;
}

export const onRender = (fn) => onFrame((t) => { fn(t); });
onFrame(() => renderer.render(scene, camera));
