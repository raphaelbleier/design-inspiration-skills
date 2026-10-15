// Fictional films, people and festivals. Any resemblance to real titles or persons is accidental.
// h* = landscape still (home roll, case hero), w* = portrait still (work cards, case director card).
const credits = (director, writer, prod, exec1, exec2, actor, actress, music) => ({ director, writer, prod, exec1, exec2, actor, actress, music });

export const films = [
  {
    id: 'the-long-tide', title: 'THE LONG TIDE', kind: 'DOCUMENTARY', year: 2024, min: 88, place: 'LISBON', h: 'h1', w: 'w4',
    fest: 'NATIONAL COMPETITION OF NORTHERN DOC', festName: 'NORTHERN DOC', director: 'MAREN ODUYA',
    reviews: ['“A QUIET, HYPNOTIC VOYAGE”', '“A FILM BASED ON A TRUE STORY”', '“RIVETING SOUNDTRACK”'],
    credits: credits('MAREN ODUYA', 'TOBIAS ECKHART', 'IVO LANDAU BREN', 'SUNNIVA ROTH', 'ELIAS MARQUARDT KOH', 'BASTIAN VOLKE', 'NINA ARRENDELL', 'CASSIAN FERRO'),
  },
  {
    id: 'empty-piazza', title: 'EMPTY PIAZZA', kind: 'SHORT FILM', year: 2024, min: 27, place: 'TURIN', h: 'h2', w: 'w2',
    fest: 'THE SOUTHERN SHORT FILM FESTIVAL', festName: 'SOUTHERN SHORTS', director: 'ILARIA VENN',
    reviews: ['“EMOTIONAL AND POWERFUL PORTRAYAL”', '“A STUNNING DEBUT”', '“TENDER AND STRANGE”'],
    credits: credits('ILARIA VENN', 'ILARIA VENN', 'OTTO BLANCHARD', 'MIRA DELACROIX', 'JONAH PELLEGRIN', 'RUFUS ALDEN', 'SOLEDAD VARGO', 'HENNA LUUKKA'),
  },
  {
    id: 'last-hand', title: 'LAST HAND', kind: 'FEATURE FILM', year: 2023, min: 104, place: 'MARSEILLE', h: 'h3', w: 'w3',
    fest: 'OFFICIAL SELECTION HARBOUR FILM WEEK', festName: 'HARBOUR FILM WEEK', director: 'DEMIAN KORTH',
    reviews: ['“DARKLY FUNNY”', '“TWO GREAT PERFORMANCES”', '“A SMOKY GEM”'],
    credits: credits('DEMIAN KORTH', 'LUCA BRANDEIS', 'PAULINE AUGUSTIN', 'RAFAEL HOLZ', 'YARA BENSIMON', 'GUSTAV ARMAND', 'ODETTE FALK', 'NOEL TAMMERT'),
  },
  {
    id: 'night-train-9', title: 'NIGHT TRAIN 9', kind: 'FEATURE FILM', year: 2024, min: 96, place: 'VIENNA', h: 'h4', w: 'w1',
    fest: 'BEST FIRST FEATURE CITY LIGHTS FESTIVAL', festName: 'CITY LIGHTS', director: 'KAI ROSENBERG-LU',
    reviews: ['“TENSE AND ELEGANT”', '“NEON-DRENCHED NOIR”', '“ONE TO WATCH”'],
    credits: credits('KAI ROSENBERG-LU', 'PIA HOLTZMANN', 'ARNO VESSELY', 'CLARA INGRAM', 'MATEO DRESCHER', 'ELIAN WOLFE', 'TESS ORLOWSKA', 'ANDRO PELL'),
  },
  {
    id: 'slow-burn', title: 'SLOW BURN', kind: 'DOCUMENTARY', year: 2022, min: 74, place: 'PRAGUE', h: 'h5', w: 'w5',
    fest: 'GRAND PRIZE OF THE VALLEY DOCS', festName: 'VALLEY DOCS', director: 'HANNE ASKELAND',
    reviews: ['“PATIENT AND PAINTERLY”', '“A LANDSCAPE IN MOTION”', '“UNFORGETTABLE FINALE”'],
    credits: credits('HANNE ASKELAND', 'HANNE ASKELAND', 'VIKTOR SARGENT', 'LEONIE BAUCH', 'DAVIDE MORELLO', 'NONE LISTED', 'NONE LISTED', 'EMIL STRAND'),
  },
  {
    id: 'red-balcony', title: 'RED BALCONY', kind: 'SHORT FILM', year: 2023, min: 19, place: 'BUDAPEST', h: 'h6', w: 'w6',
    fest: 'AUDIENCE AWARD OPERA HOUSE SHORTS', festName: 'OPERA SHORTS', director: 'ZSOFIA ARANY-REED',
    reviews: ['“GLAMOROUS AND SAD”', '“19 MINUTES OF PURE MOOD”', '“A VISUAL FEAST”'],
    credits: credits('ZSOFIA ARANY-REED', 'ZSOFIA ARANY-REED', 'LENNART COBB', 'AGNES THIELEN', 'PHILO MARCHETTI', 'VALENTIN ROUX', 'CELESTE ARIAS', 'IRIS DONNER'),
  },
];

export const pad = (n) => String(n).padStart(2, '0');
export const byId = (id) => films.find((f) => f.id === id) || films[0];
export const mod = (n, m) => ((n % m) + m) % m;
