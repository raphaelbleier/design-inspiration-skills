/*
 * Opening whiteboard (Framework). A plain Canvas 2D layer over the opening:
 *   marker  #C8AFF0, lineWidth 7, round caps/joins, quadratic smoothing through pointer midpoints
 *   eraser  a 50px square clearRect centred on the pointer (interpolated along the drag so fast moves leave no gaps)
 *   undo/redo  ImageData snapshots, both stacks capped at 20; Ctrl/Cmd+Z, Ctrl+Y, Ctrl+Shift+Z
 * The canvas sits under the title and decorations (they ignore pointer events) so you can doodle between them.
 */
export function initWhiteboard(opening) {
  const cv = opening.querySelector('.board'), tools = opening.querySelectorAll('.bt');
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  let tool = 'marker', drawing = false, last = null, mid = null, w = 0, h = 0;
  const undo = [], redo = [];
  const size = () => {
    const r = opening.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    if (r.width === w && r.height === h) return;
    w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    undo.length = redo.length = 0;
  };
  size(); addEventListener('resize', size);
  const snap = () => ctx.getImageData(0, 0, cv.width, cv.height);
  const push = (st, v) => { st.push(v); if (st.length > 20) st.shift(); };
  const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const erase = (p) => ctx.clearRect(p.x - 25, p.y - 25, 50, 50);
  cv.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    drawing = true; push(undo, snap()); redo.length = 0; cv.setPointerCapture(e.pointerId);
    last = mid = pos(e);
    if (tool === 'eraser') erase(last); else { ctx.fillStyle = '#C8AFF0'; ctx.beginPath(); ctx.arc(last.x, last.y, 3.5, 0, 7); ctx.fill(); }
  });
  cv.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    if (tool === 'eraser') {
      const n = Math.ceil(Math.hypot(p.x - last.x, p.y - last.y) / 12);
      for (let i = 1; i <= n; i++) erase({ x: last.x + ((p.x - last.x) * i) / n, y: last.y + ((p.y - last.y) * i) / n });
    } else {
      const m = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
      ctx.strokeStyle = '#C8AFF0'; ctx.lineWidth = 7; ctx.lineCap = ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(mid.x, mid.y); ctx.quadraticCurveTo(last.x, last.y, m.x, m.y); ctx.stroke(); mid = m;
    }
    last = p;
  });
  const end = () => { drawing = false; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  tools.forEach((b) => b.addEventListener('click', () => { tool = b.dataset.tool; tools.forEach((x) => x.classList.toggle('on', x === b)); cv.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair'; }));
  cv.style.cursor = 'crosshair';
  const swap = (from, to) => { if (!from.length) return; push(to, snap()); ctx.putImageData(from.pop(), 0, 0); };
  addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === 'z' && !e.shiftKey) { swap(undo, redo); e.preventDefault(); }
    else if (k === 'y' || (k === 'z' && e.shiftKey)) { swap(redo, undo); e.preventDefault(); }
  });
}
