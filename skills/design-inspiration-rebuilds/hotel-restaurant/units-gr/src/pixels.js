/**
 * pixels.js - 20x17 pixel-art icons for the "What defines us" cards. Each card draws a bitmap
 * into a CSS grid of <i> cells; on enter the lit cells switch on in random order
 * (4ms stagger, .01s each) so the icon "prints" itself.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './scroll.js';

const ICONS = {
  smile: ['', '', '', '      ######', '    ##      ##', '   #          #', '  #            #',
    '  #   ##  ##   #', '  #            #', '  #   #    #   #', '  #    ####    #', '   #          #',
    '    ##      ##', '      ######', '', '', ''],
  bolt: ['', '', '        ###', '       ####', '      ####', '     ####', '    ####', '   ########',
    '      ####', '     ####', '    ####', '   ####', '  ###', '', '', '', ''],
  heart: ['', '', '    ###   ###', '   ##### #####', '  ###############', '  ###############', '  ###############',
    '   #############', '    ###########', '     #########', '      #######', '       #####', '        ###',
    '         #', '', '', ''],
};
const COLORS = { smile: 'var(--green)', bolt: 'var(--red)', heart: 'var(--amber)' };

export function initPixels() {
  document.querySelectorAll('.px').forEach((el) => {
    const rows = ICONS[el.dataset.icon];
    el.style.setProperty('--c', COLORS[el.dataset.icon]);
    for (let y = 0; y < 17; y++) for (let x = 0; x < 20; x++) {
      const c = document.createElement('i');
      if (rows[y]?.[x] === '#') c.className = 'on';
      el.appendChild(c);
    }
    if (reduced) return;
    const on = el.querySelectorAll('.on');
    gsap.set(on, { opacity: 0 });
    ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true,
      onEnter: () => gsap.to(on, { opacity: 1, duration: 0.01, stagger: { each: 0.004, from: 'random' } }) });
  });
}
