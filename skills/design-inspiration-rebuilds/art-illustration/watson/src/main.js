import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { intro } from './intro.js';
import { cycle } from './thumbs.js';

gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) {
  // Lenis driven by the gsap ticker (lerp .1), same pattern as the other studies
  const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  intro(gsap, ScrollTrigger);
}
cycle(reduce);
