/* The site's custom easing vocabulary (GSAP CustomEase from cubic-bezier strings).
   slow   (.4,0,0,1)    - slow mode, state returns, circle draw
   fast   (.2,0,0,1)    - fast mode zoom, label letters
   inkMask(.01875,.08,0,.991875) - About ink reveal (2.5 s): explodes outward, then settles
   page   (.445,.05,.55,.95)     - DOM page fades (same as CSS --ease-page) */
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
gsap.registerPlugin(CustomEase);
CustomEase.create('slow', '.4,0,0,1');
CustomEase.create('fast', '.2,0,0,1');
CustomEase.create('inkMask', '.01875,.08,0,.991875');
CustomEase.create('page', '.445,.05,.55,.95');
export { gsap };
