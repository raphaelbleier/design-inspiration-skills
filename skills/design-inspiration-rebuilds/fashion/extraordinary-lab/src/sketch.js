// Procedural blueprint plates: thin white hairlines on transparent canvas, drawn once into CanvasTextures.
// Technique: 2D canvas strokes (1.5px @ 1024px), alpha .85, variants: plan, gear, section, scribble.
import * as THREE from 'three';

const rnd = (s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;

export function makeSketch(kind, seed = 1, w = 1024, h = 1280) {
  const r = rnd(seed * 977 + 13);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(255,255,255,.85)';
  g.fillStyle = 'rgba(255,255,255,.85)';
  g.lineWidth = 1.5;
  g.strokeRect(24, 24, w - 48, h - 48);
  if (kind === 'plan') {
    for (let i = 0; i < 9; i++) {
      const x = 80 + r() * (w - 380), y = 120 + r() * (h - 420);
      const bw = 120 + r() * 240, bh = 90 + r() * 220;
      g.strokeRect(x, y, bw, bh);
      g.beginPath(); g.arc(x + bw, y + bh * .5, 26, Math.PI * .5, Math.PI * 1.5); g.stroke();
      g.setLineDash([6, 8]); g.beginPath(); g.moveTo(x, y + bh + 24); g.lineTo(x + bw, y + bh + 24); g.stroke(); g.setLineDash([]);
    }
  } else if (kind === 'gear') {
    for (let k = 0; k < 3; k++) {
      const cx = 280 + r() * (w - 560), cy = 280 + k * 300 + r() * 80, R = 90 + r() * 120, n = 14 + Math.floor(r() * 16);
      g.beginPath();
      for (let i = 0; i <= n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? R : R * 1.12; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      g.closePath(); g.stroke();
      g.beginPath(); g.arc(cx, cy, R * .3, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(cx - R * 1.4, cy); g.lineTo(cx + R * 1.4, cy); g.moveTo(cx, cy - R * 1.4); g.lineTo(cx, cy + R * 1.4); g.stroke();
    }
  } else if (kind === 'section') {
    for (let i = 0; i < 16; i++) { const y = 90 + i * 60; g.beginPath(); g.moveTo(60, y); g.bezierCurveTo(w * .3, y - 70 * r(), w * .6, y + 90 * r(), w - 60, y + 20 * r()); g.stroke(); }
  } else {
    // scribble: rows of wavy "handwriting", no legible words
    for (let y = 110; y < h - 90; y += 34) {
      g.beginPath(); g.moveTo(70, y);
      for (let x = 70; x < w - 90 - r() * 200; x += 14) g.lineTo(x, y + Math.sin(x * .45 + r() * 2) * 5 * r());
      g.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
