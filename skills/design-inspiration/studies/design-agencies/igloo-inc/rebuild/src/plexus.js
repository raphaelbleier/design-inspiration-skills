/**
 * "Plexus": thin white hairlines between floating nodes, with small crosses and numeric labels.
 *
 * TECHNIQUE: nodes drift on a sine orbit (JS, ~20 nodes is nothing). Lines connect each node to
 * its k nearest neighbours once at build time; positions are rewritten each frame into one
 * LineSegments buffer. Labels are 2-digit canvas-texture sprites in IBM Plex Mono.
 * Coordinates are in "plate heights" (the parent group is scaled uniformly to the plate height),
 * so a plexus placed over the igloo stays glued to it while the camera moves.
 */
import * as THREE from 'three';

function labelTexture(text) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 32;
  const g = c.getContext('2d');
  g.font = '500 20px "IBM Plex Mono", monospace';
  g.fillStyle = '#fff';
  g.textBaseline = 'middle';
  g.fillText(text, 4, 17);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearFilter;
  return t;
}

export function createPlexus({ center = [0, 0, 0], radius = [0.3, 0.22, 0.12], count = 14, k = 2, labels = true, seed = 1 }) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const nodes = Array.from({ length: count }, () => {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
    return { b: [center[0] + Math.cos(a) * r * radius[0], center[1] + Math.sin(a) * r * radius[1], center[2] + (rnd() - 0.5) * 2 * radius[2]], ph: rnd() * 6.28 };
  });
  const pairs = [];
  nodes.forEach((n, i) => {
    nodes
      .map((m, j) => [j, Math.hypot(n.b[0] - m.b[0], n.b[1] - m.b[1])])
      .filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]).slice(0, k)
      .forEach(([j]) => { if (!pairs.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) pairs.push([i, j]); });
  });
  const group = new THREE.Group();
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pairs.length * 6), 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;
  group.add(lines);

  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const ptMat = new THREE.PointsMaterial({ color: 0xffffff, size: 4, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false });
  const pts = new THREE.Points(ptGeo, ptMat);
  pts.frustumCulled = false;
  group.add(pts);

  const sprites = [];
  if (labels) {
    nodes.forEach((n, i) => {
      if (i % 3) return;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture(String(10 + Math.floor(rnd() * 80))), transparent: true, depthWrite: false }));
      sp.scale.set(0.032, 0.016, 1);
      sp.userData.i = i;
      group.add(sp);
      sprites.push(sp);
    });
  }
  const cur = nodes.map(() => [0, 0, 0]);
  return {
    group,
    setOpacity(o) {
      lineMat.opacity = 0.85 * o; ptMat.opacity = 0.9 * o;
      sprites.forEach((sp) => (sp.material.opacity = o));
      group.visible = o > 0.003;
    },
    update(t) {
      nodes.forEach((n, i) => {
        cur[i][0] = n.b[0] + Math.sin(t * 0.5 + n.ph) * 0.012;
        cur[i][1] = n.b[1] + Math.cos(t * 0.43 + n.ph * 1.3) * 0.012;
        cur[i][2] = n.b[2];
        ptGeo.attributes.position.setXYZ(i, ...cur[i]);
      });
      pairs.forEach(([a, b], i) => {
        lineGeo.attributes.position.setXYZ(i * 2, ...cur[a]);
        lineGeo.attributes.position.setXYZ(i * 2 + 1, ...cur[b]);
      });
      sprites.forEach((sp) => sp.position.set(cur[sp.userData.i][0] + 0.02, cur[sp.userData.i][1] + 0.01, cur[sp.userData.i][2]));
      lineGeo.attributes.position.needsUpdate = true;
      ptGeo.attributes.position.needsUpdate = true;
    },
  };
}
