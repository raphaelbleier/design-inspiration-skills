/**
 * Custom eases + global motion switch.
 *
 * The original uses its own tween helper with GSAP-compatible ease names. We use GSAP and register the
 * four cubic-Bezier curves that were extracted from the original timeline:
 *   inOut1  M0,0 C0.5,0   0.1,1 1,1     slow start, long soft landing (planet y, button spin)
 *   inOut2  M0,0 C0.56,0  0,1   1,1
 *   inOut3  M0,0 C0.6,0   0,1   1,1     (planet scale / rotation, 6.3s)
 *   tweaked M0,0 C0.388,0 0.441,0.356 0.496,0.496 0.553,0.641 0.647,1 1,1   (camera orbit, almost linear mid)
 * Built-in eases used elsewhere: power2.inOut, elastic.out(1, 0.9), elastic.out(1, 0.5), none.
 *
 * Reduced motion: GSAP's global timeline is sped up x12 so every sequence still plays in the right order
 * (state changes and callbacks keep working) but finishes almost instantly. Idle loops (auto-rotate, ink boil,
 * glyph wiggle) check REDUCED and stay still.
 */
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);
CustomEase.create('inOut1', 'M0,0 C0.5,0 0.1,1 1,1');
CustomEase.create('inOut2', 'M0,0 C0.56,0 0,1 1,1');
CustomEase.create('inOut3', 'M0,0 C0.6,0 0,1 1,1');
CustomEase.create('tweaked', 'M0,0 C0.388,0 0.441,0.356 0.496,0.496 0.553,0.641 0.647,1 1,1');

export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
gsap.ticker.lagSmoothing(0); // wall-clock timelines even on slow GPUs
if (REDUCED) gsap.globalTimeline.timeScale(12);
export { gsap };
