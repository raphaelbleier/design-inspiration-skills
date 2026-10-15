/*
 * SLIDE CONTROLLER (home roll + work slider)
 * ------------------------------------------
 * Native scroll is disabled on those pages. State is three numbers, in "slides":
 *   current  what is drawn         (lerps toward target, 0.05 desktop / 0.09 touch)
 *   target   where we are going    (target += speed every frame, snaps to round(target) when slow)
 *   speed    input impulse         (wheel adds deltaY * 0.001, drag adds, speed *= 0.85 per frame)
 *   lspeed   visual speed          (lerp 0.1 toward |current velocity|; feeds shader blur AND CSS text blur)
 *
 * Input: wheel, mouse drag (not on touch), touch drag (x5.5), ArrowUp/Down (and Left/Right), 200 ms cooldown.
 * Config mirrors the original: snapFactor 0.1, snapThreshold 0.25, mouseMultiplier 0.5, touchMultiplier 5.5.
 * `onSettle` fires once when the roll has stopped on a slide (the title rollover starts from that).
 * Frame-rate independence: every lerp/damp uses 1-(1-k)^(dt*60).
 */
import { mod } from './data.js';

const cfg = { scrollSpeed: 0.001, damp: 0.85, snapFactor: 0.1, snapThreshold: 0.25, lerp: 0.05, lerpTouch: 0.09, mouse: 0.5, touch: 5.5 };
const k = (f, dt) => 1 - Math.pow(1 - f, dt * 60);

export class Slider {
  constructor({ count, axis = 'y', loop = true, reduced = false, onSettle = () => {}, onMove = () => {} }) {
    Object.assign(this, { count, axis, loop, reduced, onSettle, onMove });
    this.current = 0; this.target = 0; this.speed = 0; this.lspeed = 0; this.vel = 0;
    this.settled = true; this.lastKey = 0; this.dragging = false; this.dead = false;
    this.touch = matchMedia('(pointer: coarse)').matches;
    this._bind();
  }

  _bind() {
    const wheel = (e) => {
      if (this.locked) return; e.preventDefault();
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      this.speed += d * cfg.scrollSpeed * (e.deltaMode === 1 ? 30 : 1); this.settled = false;
    };
    const down = (e) => { if (e.pointerType === 'touch' || e.target.closest('a,button,label,[data-cursor="hide"]')) { if (e.pointerType !== 'touch') return; } this.dragging = true; this.dragId = e.pointerId; this.px = e.clientX; this.py = e.clientY; this.dragged = 0; };
    const move = (e) => {
      if (!this.dragging || e.pointerId !== this.dragId) return;
      const dx = e.clientX - this.px, dy = e.clientY - this.py; this.px = e.clientX; this.py = e.clientY;
      const d = this.axis === 'y' ? dy : dx;
      this.dragged += Math.abs(d);
      const size = this.axis === 'y' ? innerHeight : innerWidth * 0.5;
      this.speed -= (d / size) * (e.pointerType === 'touch' ? cfg.touch * 0.18 : cfg.mouse * 0.35); this.settled = false;
    };
    const up = (e) => { if (e.pointerId === this.dragId) this.dragging = false; };
    const key = (e) => {
      const next = e.key === 'ArrowDown' || e.key === 'ArrowRight', prev = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
      if (!next && !prev) return;
      const now = performance.now(); if (now - this.lastKey < 200) return; this.lastKey = now;
      this.go(next ? 1 : -1);
    };
    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    window.addEventListener('keydown', key);
    this._off = () => {
      window.removeEventListener('wheel', wheel); window.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); window.removeEventListener('keydown', key);
    };
  }

  go(dir) { this.target = Math.round(this.target) + dir; this.speed = 0; this.settled = false; }
  goTo(i) { const base = Math.round(this.target); let d = mod(i - base, this.count); if (d > this.count / 2) d -= this.count; this.target = base + d; this.speed = 0; this.settled = false; }
  get index() { return mod(Math.round(this.loop ? this.target : this.target), this.count); }

  /** signed distance of slide i from the visual centre, wrapped to [-count/2, count/2) */
  offset(i) { let d = i - this.current; if (this.loop) d = mod(d + this.count / 2, this.count) - this.count / 2; return d; }

  update(dt) {
    dt = Math.min(dt, 0.1);
    const f = Math.pow(cfg.damp, dt * 60);
    this.target += this.speed * Math.min(dt * 60, 3);
    this.speed *= f;
    if (!this.loop) this.target = Math.max(0, Math.min(this.count - 1, this.target));
    if (!this.dragging && Math.abs(this.speed) < 0.0012) {            // slow enough: snap to the nearest slide
      const r = Math.round(this.target);
      if (Math.abs(this.target - r) < 0.0005) this.target = r;
      else this.target += (r - this.target) * k(cfg.snapFactor, dt);
    }
    const prev = this.current;
    this.current += (this.target - this.current) * k(this.touch ? cfg.lerpTouch : cfg.lerp, dt);
    this.vel = (this.current - prev) / Math.max(dt * 60, 0.001);      // slides per 60fps frame
    this.lspeed += (Math.min(Math.abs(this.vel), 0.2) - this.lspeed) * k(0.1, dt);
    const idle = Math.abs(this.speed) < 0.0012 && Math.abs(this.target - this.current) < 0.002 && !this.dragging;
    if (idle && !this.settled) { this.settled = true; this.current = this.target; this.onSettle(this.index); }
    if (!idle) this.settled = false;
    this.onMove(this);
  }

  destroy() { this._off(); this.dead = true; }
}
