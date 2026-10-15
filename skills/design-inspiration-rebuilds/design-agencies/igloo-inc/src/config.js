/**
 * Single source of truth for tokens, copy and scene layout.
 * All numbers mirror the studied site's structure; copy/brands are invented.
 */
export const COLORS = {
  bg: 0xa0a5b1, // --bgColor: page + canvas clear colour
  text: '#ffffff',
  title: '#3c3c54',
  gradA: '#09121f', // detail / cubes gradient start
  gradB: '#6b7685', // detail / cubes gradient end
  fog: 0xd1d6e3,
};

/** Virtual-scroll pages, in loop order. height = scroll units (1 unit ~ 1333 px of wheel delta). */
export const SCENES = [
  { id: 'igloo', label: '01 / Shelter', height: 2.35 },
  { id: 'cubes', label: '02 / Archive', height: 2 },
  { id: 'entry', label: '03 / Descent', height: 5.5 },
];

/** Length (scroll units) at the end of each page that is spent in the frost-wipe handover. */
export const TRANSITION = 0.7;

export const PROJECTS = [
  {
    slug: 'fuzzle-collective',
    code: 'PORTFOLIO_CO_01',
    name: 'Fuzzle Collective',
    image: 'cover1',
    summary: [
      'Fuzzle Collective is a cast of round, headphone-wearing bear cubs that grew from a group chat into a community of eight thousand owners.',
      'We shaped the identity, the sound of the world and the launch ritual: a ten-minute radio show where every cub was revealed live.',
      'The brand now lives across collectibles, a plush line and a weekly listening session that nobody wants to miss.',
    ],
  },
  {
    slug: 'crosswind',
    code: 'PORTFOLIO_CO_02',
    name: 'Crosswind',
    image: 'cover2',
    summary: [
      'Crosswind is a payments network built for speed, with a brand drawn around a single ribbon that never lifts off the page.',
      'We designed the mark, the motion language and a launch site that settles like fresh snow after a storm.',
      'Transfers confirm before the animation finishes. We kept the animation short on purpose.',
    ],
  },
];
