/*
 * GSAP SETUP + MOTION TOKENS
 *
 * The whole site speaks with a tiny motion vocabulary: three durations, five
 * eases, one stagger. Every effect module imports from here instead of
 * inventing numbers, which is what makes the choreography feel authored.
 *
 *   durS 0.4  durM 0.8  durL 1.2   stagger 0.1   delayReveal 0.2   breakpoint 992px
 *   InOut  0.76,0,0.24,1   Out 0.25,1,0.5,1   In 0.5,0,0.75,0
 *   Ease   0.25,0.1,0.25,1  Write 0.333,0,0.667,1
 *
 * lagSmoothing(0): never let GSAP "catch up" after a slow frame; Lenis is
 * driven from the same ticker, so scroll and tweens stay in lockstep.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Flip, Draggable, InertiaPlugin);
gsap.ticker.lagSmoothing(0);

export const T = { durS: 0.4, durM: 0.8, durL: 1.2, stagger: 0.1, delayReveal: 0.2, bp: 992 };

CustomEase.create('InOut', '0.76,0,0.24,1');
CustomEase.create('Out', '0.25,1,0.5,1');
CustomEase.create('In', '0.5,0,0.75,0');
CustomEase.create('Ease', '0.25,0.1,0.25,1');
CustomEase.create('Write', '0.333,0,0.667,1');

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isDesktop = () => innerWidth >= T.bp;
export const hasHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

export { gsap, ScrollTrigger, SplitText, Flip, Draggable };
