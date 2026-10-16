// Content: three rooms, hotspots in image-uv space (0..1, origin top-left). All fictional.
export const ROOMS = [
  { id: 'foyer', name: 'Foyer', img: 'img/room-foyer.webp', color: '#cbbdb0', aspect: 16 / 9,
    line: 'Rules are meant to be mended.',
    hint: 'Pick up the notebook and get started',
    spots: [
      { type: 'bag', x: .28, y: .46, bag: 0 },
      { type: 'door', x: .5, y: .5, to: 1, label: 'Open the red door' },
      { type: 'door', x: .86, y: .5, to: 2, label: 'Open the green door' },
    ] },
  { id: 'salon', name: 'Salon', img: 'img/room-salon.webp', color: '#c2b3c9', aspect: 16 / 9,
    line: 'Every seam is a small decision.',
    hint: 'Something is resting on the armchair',
    spots: [
      { type: 'bag', x: .42, y: .56, bag: 1 },
      { type: 'bag', x: .74, y: .62, bag: 2 },
      { type: 'door', x: .1, y: .5, to: 0, label: 'Back to the foyer' },
    ] },
  { id: 'atelier', name: 'Atelier', img: 'img/room-atelier.webp', color: '#b7c4b0', aspect: 16 / 9,
    line: 'Made slowly, carried quickly.',
    hint: 'Look closer at the workbench',
    spots: [
      { type: 'bag', x: .55, y: .6, bag: 3 },
      { type: 'door', x: .08, y: .5, to: 0, label: 'Back to the foyer' },
    ] },
];

export const BAGS = [
  { name: 'The Notebook Tote', img: 'img/bag-tote.webp', note: 'Soft calfskin, square shoulders, one pocket just the size of a diary.' },
  { name: 'The Pleat Satchel', img: 'img/bag-satchel.webp', note: 'Hand-pleated nappa with a brass turn lock and a detachable strap.' },
  { name: 'The Little Envelope', img: 'img/bag-envelope.webp', note: 'A folded clutch in washed satin that becomes a crossbody in a flick.' },
  { name: 'The Workbench Duffle', img: 'img/bag-duffle.webp', note: 'Waxed canvas, saddle-stitched handles, a lining printed with pattern drafts.' },
];
