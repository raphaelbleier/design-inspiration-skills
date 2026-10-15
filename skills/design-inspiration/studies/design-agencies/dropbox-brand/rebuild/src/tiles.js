/*
 * The 8-tile mosaic. It is both the home page and the navigation menu on every
 * subpage, so the DOM is built once here and driven two ways:
 *   - home.js writes a transform per frame from scroll progress (layoutTiles)
 *   - shell.js toggles CSS classes (.open / .close) whose transitions go to/from the
 *     same "yeeted" start pose (setClosedPose writes --tx/--ty once per resize).
 *
 * Fly-in technique ("yeet"): at progress 0 each tile is scaled x2 and thrown
 * off-screen along a per-tile vector; at progress 1 it rests in the mosaic.
 *   yeet  = (max(vw,vh) - 90) / 2   (the original halves this again; with a Bricolage-sized mosaic the tiles
 *                                    then still overlap the viewport at progress 0, so we throw them twice as far)
 *   fwd   = eased - 1            (<= 0)      used when the vector component > 0
 *   bwd   = 1 - eased            (>= 0)      used when the vector component < 0
 *   tx    = (vx > 0 ? fwd : bwd) * |vx * yeet|     (same for y)
 *   scale = 2 - eased
 * Lines (1px hairlines) are counter-scaled by 1/scale so they never thicken.
 */
import { PAGES, pageHref } from './data.js';
import { markSVG } from './brandmark.js';

export const VECTORS = {
  desktop: [[4, 2], [-0.1, 1], [-1, -0.1], [-4, 2], [4, -2], [1, 0.1], [0.1, -1], [-4, -2]],
  mobile: [[2, 3], [-2, 3], [0.25, 1.5], [-1.5, 0.25], [1.5, -0.25], [-0.25, -1.5], [2, -3], [-2, -3]],
};

const VISUALS = {
  framework: `<i class="fw-n" style="left:12%;top:51%"></i><i class="fw-n" style="left:12%;top:93%"></i><i class="fw-n" style="left:87%;top:72%"></i>
    <svg class="fw-l" preserveAspectRatio="none" viewBox="0 0 100 100"><path d="M12 51L87 72L12 93" fill="none" stroke="currentColor" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`,
  // "66" / "99" quote marks drawn as comma shapes (circle + tail); the opening pair is the closing pair rotated 180deg
  'voice-and-tone': `<svg class="q q1" viewBox="-2 -2 112 84"><g fill="currentColor" transform="rotate(180 54 40)"><circle cx="22" cy="24" r="19"/><path d="M40 26C40 52 25 68 4 74L0 62C12 56 18 48 19 38z"/><circle cx="76" cy="24" r="19"/><path d="M94 26C94 52 79 68 58 74L54 62C66 56 72 48 73 38z"/></g></svg><svg class="q q2" viewBox="-2 -2 112 84"><g fill="currentColor"><circle cx="22" cy="24" r="19"/><path d="M40 26C40 52 25 68 4 74L0 62C12 56 18 48 19 38z"/><circle cx="76" cy="24" r="19"/><path d="M94 26C94 52 79 68 58 74L54 62C66 56 72 48 73 38z"/></g></svg>`,
  logo: markSVG('tile-mark'),
  typography: `<span class="aa">Aa</span>`,
  iconography: `<svg class="lock" viewBox="0 0 80 100"><path d="M18 44V30a22 22 0 0 1 44 0v14" fill="none" stroke="currentColor" stroke-width="9"/><rect x="4" y="42" width="72" height="54" rx="14" fill="none" stroke="currentColor" stroke-width="9"/><circle cx="40" cy="64" r="6" fill="currentColor"/><path d="M40 66v14" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>`,
  color: `<i class="sq sq1"></i><i class="sq sq2"></i>`,
  imagery: `<div class="img-card"><svg viewBox="0 0 225 180" preserveAspectRatio="xMidYMid slice"><rect width="225" height="180" fill="#ffafa5"/><g class="sunandmoon" style="transform-origin:82px 68px"><circle cx="82" cy="68" r="18" fill="#cd2f7b"/><circle class="moon" cx="90" cy="62" r="14" fill="#ffafa5"/></g><path d="M0 125c30-10 45 10 75 0s50-60 80-62 50 15 70 20V180H0z" fill="#cd2f7b"/></svg></div>`,
  motion: `<svg class="bz" preserveAspectRatio="none" viewBox="0 0 100 100"><path d="M13 92L26 92M13 92C45 92 52 8 87 8L74 8" fill="none" stroke="currentColor" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg><i class="bh" style="left:13%;top:92%"></i><i class="bh" style="left:26%;top:92%"></i><i class="bh" style="left:74%;top:8%"></i><i class="bh" style="left:87%;top:8%"></i>`,
};

export function buildNav(root, { withLines = false } = {}) {
  root.innerHTML = PAGES.map((p, i) => `
    <div class="unit u-${p.slug}" data-i="${i}">
      ${withLines ? '<i class="gl gl-t"></i><i class="gl gl-b"></i><i class="gl gl-l"></i><i class="gl gl-r"></i>' : ''}
      <a class="tile" href="${pageHref(p.slug)}" data-slug="${p.slug}" style="--tile-bg:${p.bg};--tile-fg:${p.fg}" inert>
        <span class="tile-title">${p.title}</span>
        <span class="tile-visual v-${p.slug}">${VISUALS[p.slug]}</span>
      </a>
    </div>`).join('');
  const units = [...root.querySelectorAll('.unit')];
  // Sun/moon: each mouseenter spins the group a further 360deg so it always turns the same way.
  const sm = root.querySelector('.sunandmoon');
  const imagery = root.querySelector('.u-imagery .tile');
  let day = 0;
  imagery?.addEventListener('mouseenter', () => setTimeout(() => {
    sm.style.transform = `rotate(${360 * day + 155}deg)`; sm.querySelector('.moon').style.fill = '#892055'; day++;
  }, 100));
  imagery?.addEventListener('mouseleave', () => {
    sm.style.transform = `rotate(${360 * day}deg)`; sm.querySelector('.moon').style.fill = '#ffafa5'; day++;
  });
  return units;
}

export const isMobileLayout = () => innerWidth <= 991;

/** Position every unit for eased progress e (0 = flung out, 1 = rest). */
export function layoutTiles(units, e) {
  const vec = isMobileLayout() ? VECTORS.mobile : VECTORS.desktop;
  const yeet = (Math.max(innerWidth, innerHeight) - 90) / 2;
  const fwd = e - 1, bwd = 1 - e, s = 2 - e;
  units.forEach((u, i) => {
    const [x, y] = vec[i];
    const tx = (x > 0 ? fwd : bwd) * Math.abs(x * yeet);
    const ty = (y > 0 ? fwd : bwd) * Math.abs(y * yeet);
    u.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
    u.style.setProperty('--inv', 1 / s);
  });
}

/** Menu variant: write the closed pose into CSS vars; the .open class resets it. */
export function setClosedPose(units) {
  const vec = isMobileLayout() ? VECTORS.mobile : VECTORS.desktop;
  const yeet = (Math.max(innerWidth, innerHeight) - 90) / 2;
  units.forEach((u, i) => {
    const [x, y] = vec[i];
    u.style.setProperty('--tx', `${(x > 0 ? -1 : 1) * Math.abs(x * yeet)}px`);
    u.style.setProperty('--ty', `${(y > 0 ? -1 : 1) * Math.abs(y * yeet)}px`);
  });
}
