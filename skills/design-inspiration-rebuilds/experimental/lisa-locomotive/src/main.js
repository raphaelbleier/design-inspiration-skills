import './style.css';
import { createDialog } from './dialog.js';
import { toggleSound } from './sound.js';
import { createScene } from './scene.js';

const $ = (id) => document.getElementById(id);
const scene = createScene($('stage'));

const dialog = createDialog({
  dialog: $('dialog'), controls: $('controls'), back: $('back'), progress: $('progress'),
  onStep: () => scene.react(),
});
$('sound').onclick = (e) => toggleSound(e.currentTarget);
dialog.start();
