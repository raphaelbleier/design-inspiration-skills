/* Shared page + tile data. Tile order matters: it indexes the fly-in vectors in tiles.js. */
export const BRAND = 'Cairn';
export const PAGES = [
  { slug: 'framework', title: 'Framework', bg: '#283750', fg: '#b4c8e1', id: 'blue' },
  { slug: 'voice-and-tone', title: 'Voice & Tone', bg: '#fad24b', fg: '#684505', id: 'yellow' },
  { slug: 'logo', title: 'Logo', bg: '#3dd3ee', fg: '#055463', id: 'cyan' },
  { slug: 'typography', title: 'Typography', bg: '#fa551e', fg: '#4e0119', id: 'red' },
  { slug: 'iconography', title: 'Iconography', bg: '#b4dc19', fg: '#175641', id: 'green' },
  { slug: 'color', title: 'Color', bg: '#ff8c19', fg: '#6d2e09', id: 'orange' },
  { slug: 'imagery', title: 'Imagery', bg: '#892055', fg: '#ffafa5', id: 'pink' },
  { slug: 'motion', title: 'Motion', bg: '#c8aff0', fg: '#682760', id: 'purple' },
];
export const pageHref = (slug) => `./${slug}.html`;
export const currentSlug = () => document.body.dataset.page || 'home';
