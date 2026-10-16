// Pixel art. Every sprite is a Px canvas, drawn from ASCII rows.
import { Px } from './pixel.mjs';
import { C } from './theme.mjs';

function rows(list) {
  const w = list[0].length;
  list.forEach((r, i) => {
    if (r.length !== w) throw new Error(`sprite row ${i} is ${r.length} wide, expected ${w}: "${r}"`);
  });
  return list;
}

// ── the mascot: a blue cat on inline skates ─────────────────────────────────
const CAT = {
  o: C.ink, b: C.cat, d: C.catShade, l: C.catLight, w: C.white, p: C.pink, e: C.ink, h: C.white,
  n: C.pink, m: C.ink, r: C.red, R: '#B8323A', s: C.orange, S: C.orangeDeep, k: C.ink, g: C.curb, y: C.yellow,
};

const CAT_HEAD = rows([
  '..oo..............oo..',
  '.obbo............obbo.',
  '.obpbo..........obpbo.',
  '.obppboooooooooobppbo.',
  '.oblbbbbbbbbbbbbbbbbo.',
  'obllbbbbbbbbbbbbbbbbdo',
  'oblbbbbbbbbbbbbbbbbbdo',
  'obbbbbhebbbbbbhebbbbdo',
  'obbbbbeebbbbbbeebbbbdo',
  'obbbppbbbbnnbbbbppbbdo',
  'obbbbbbbbmbbmbbbbbbbdo',
  '.obbbbbbbbmmbbbbbbbdo.',
  '..oddbbbbbbbbbbbbddo..',
]);

// Body + skates. Two frames so the legs push off like skating strides.
const CAT_BODY = [
  rows([
    '...orrrrrrrrrrrrrrro..',
    '...oRrrrrrrrrrrrrrRo..',
    '..obbowwwwwwwwwwobbo..',
    '..obbowwwwwwwwwwobbo..',
    '...oobwwwwwwwwwwboo...',
    '....obbbbbbbbbbbbo....',
    '....obbbo....obbbo....',
    '...osssso....osssso...',
    '...oSSSSo....oSSSSo...',
    '...kgkgk.....kgkgk....',
  ]),
  rows([
    '...orrrrrrrrrrrrrrro..',
    '...oRrrrrrrrrrrrrrRo..',
    '..obbowwwwwwwwwwobbo..',
    '..obbowwwwwwwwwwobbo..',
    '...oobwwwwwwwwwwboo...',
    '....obbbbbbbbbbbbo....',
    '.....obbbo..obbbo.....',
    '....osssso..osssso....',
    '....oSSSSo..oSSSSo....',
    '....kgkgk...kgkgk.....',
  ]),
];

// Scarf tail fluttering behind (to the left).
const TAILS = [
  rows(['.rrro', 'rrRo.', '.ro..']),
  rows(['rrrro', '.rRRo', '..ro.']),
];

export function cat(frame = 0) {
  const px = new Px(28, 25);
  px.stamp(6, 0, CAT_HEAD, CAT);
  px.stamp(6, 13, CAT_BODY[frame % 2], CAT);
  px.stamp(4 + (frame % 2), 14, TAILS[frame % 2], CAT);
  return px;
}

// Just the face, for the avatar.
export function catFace() {
  const px = new Px(22, 15);
  px.stamp(0, 0, CAT_HEAD, CAT);
  px.stamp(3, 13, rows(['.orrrrrrrrrrrrrrro', '.oRrrrrrrrrrrrrrRo']), CAT);
  return px;
}

// ── scenery ─────────────────────────────────────────────────────────────────
export function cone() {
  return new Px(11, 13).stamp(0, 0, rows([
    '....oo.....',
    '...osso....',
    '...osso....',
    '..owwwwo...',
    '..owwwwo...',
    '..ossSSo...',
    '.ossssSSo..',
    '.owwwwwwo..',
    'owwwwwwwwo.',
    'ossssssSSo.',
    'ooooooooooo',
    'oSSSSSSSSSo',
    'ooooooooooo',
  ]), { o: C.ink, s: C.orange, S: C.orangeDeep, w: C.white });
}

export function cloud(color = C.white, shade = C.mist) {
  const p = new Px(30, 12);
  p.ellipse(9, 7.5, 6.5, 4.2, color);
  p.ellipse(17, 5.5, 7.5, 5.2, color);
  p.ellipse(24, 8, 5.2, 3.6, color);
  p.rect(4, 8, 22, 3, color);
  p.recolor(color, shade, (x, y) => y >= 9);
  return p.outline(C.pale);
}

export function sun(r = 9, color = C.yellow, rim = '#FFB23F') {
  const p = new Px(r * 2 + 2, r * 2 + 2);
  p.ellipse(r + 1, r + 1, r, r, rim);
  p.ellipse(r + 1, r + 1, r - 1.6, r - 1.6, color);
  p.ellipse(r - 1.5, r - 1.5, r * 0.35, r * 0.35, '#FFE39A');
  return p;
}

// Bangkok-ish skyline: towers, a stepped temple spire and a jagged supertall.
export function skyline(w, h, color, light) {
  const p = new Px(w, h);
  const b = (x, top, bw) => p.rect(x, h - top, bw, top, color);
  let x = 0;
  const pattern = [
    [9, 7], [14, 6], [11, 8], [20, 5], [8, 9], [16, 7], [12, 6], [24, 6], [10, 8], [15, 5],
    [18, 7], [9, 6], [13, 8], [22, 6], [11, 7], [17, 5], [10, 9], [14, 6],
  ];
  let i = 0;
  while (x < w) {
    const [top, bw] = pattern[i % pattern.length];
    b(x, top, bw);
    // windows
    for (let wy = h - top + 2; wy < h - 2; wy += 3) for (let wx = x + 1; wx < x + bw - 1; wx += 2) if ((wx + wy + i) % 3 === 0) p.set(wx, wy, light);
    x += bw;
    i++;
  }
  // a jagged supertall
  const mx = Math.floor(w * 0.62);
  for (let y = 0; y < 34 && y < h; y++) {
    const notch = (Math.floor(y / 3) % 3 === 0) ? 1 : 0;
    p.rect(mx + notch, h - y - 1, 6 - notch, 1, color);
  }
  p.rect(mx + 2, h - 38, 1, 4, color);
  // a temple prang (stepped spire)
  const tx = Math.floor(w * 0.22);
  const steps = [[13, 4], [11, 4], [9, 4], [7, 4], [5, 5], [3, 5], [1, 5]];
  let ty = h;
  steps.forEach(([sw, sh]) => {
    p.rect(tx - Math.floor(sw / 2), ty - sh, sw, sh, color);
    ty -= sh;
  });
  p.rect(tx, ty - 3, 1, 3, color);
  // a tower with an antenna
  const ax = Math.floor(w * 0.84);
  p.rect(ax, h - 26, 5, 26, color);
  p.rect(ax + 2, h - 32, 1, 6, color);
  return p;
}

export function raindrop() {
  return new Px(1, 4).rect(0, 0, 1, 4, C.sky);
}

export function bird(frame = 0) {
  const art = frame ? ['.......', '.##.##.', '#..#..#'] : ['#.....#', '.#...#.', '..#.#..'];
  return new Px(7, 3).stamp(0, 0, rows(art), { '#': C.inkSoft });
}

export function sparkle(color = C.sky) {
  return new Px(7, 7).stamp(0, 0, rows(['...#...', '...#...', '..###..', '#######', '..###..', '...#...', '...#...']), { '#': color });
}

export function heart(color = C.pink) {
  return new Px(7, 6).stamp(0, 0, rows(['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...']), { '#': color });
}

export function cake() {
  return new Px(13, 12).stamp(0, 0, rows([
    '......y......',
    '......o......',
    '......o......',
    '.ooooooooooo.',
    'owwwwwwwwwwwo',
    'opppwppwpppwo',
    'oSSSSSSSSSSSo',
    'owwwwwwwwwwwo',
    'oSSSSSSSSSSSo',
    'oSSSSSSSSSSSo',
    '.ooooooooooo.',
    '.............',
  ]), { o: C.ink, y: C.yellow, w: C.white, p: C.pink, S: '#C98A5E' });
}

export function trophy() {
  return new Px(14, 14).stamp(0, 0, rows([
    '..oooooooooo..',
    'ooyyyyyyyyYYoo',
    'oyoyyyyyyyYoYo',
    'oyoyyhyyyyYoYo',
    '.ooyyhyyyyYoo.',
    '...oyyyyyYo...',
    '....oyyyYo....',
    '.....oyYo.....',
    '......oo......',
    '.....oYYo.....',
    '....oooooo....',
    '...obbbbbbo...',
    '...oBBBBBBo...',
    '...oooooooo...',
  ]), { o: C.ink, y: C.yellow, Y: '#E5A53A', h: '#FFF1C2', b: C.blue, B: C.ink });
}

// ── tile icons (14×14 rounded squares, like app icons) ──────────────────────
function tile(bg) {
  const p = new Px(14, 14);
  p.rect(2, 0, 10, 14, bg);
  p.rect(0, 2, 14, 10, bg);
  p.rect(1, 1, 12, 12, bg);
  return p;
}

// Thin rotated ellipse ring, for the React atom.
function ring(p, cx, cy, rx, ry, angle, color) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let t = 0; t < 360; t += 2) {
    const a = (t * Math.PI) / 180;
    const ex = rx * Math.cos(a);
    const ey = ry * Math.sin(a);
    p.set(Math.floor(cx + ex * cos - ey * sin), Math.floor(cy + ex * sin + ey * cos), color);
  }
}

export const ICONS = {
  typescript: () => tile('#3178C6').stamp(2, 5, rows([
    '#####.####',
    '..#..#....',
    '..#...##..',
    '..#.....#.',
    '..#..###..',
  ]), { '#': C.white }),
  nextjs: () => {
    const p = new Px(14, 14);
    p.ellipse(7, 7, 7, 7, '#111111');
    return p.stamp(4, 3, rows([
      '#....#',
      '##...#',
      '#.#..#',
      '#..#.#',
      '#...##',
      '#....#',
      '#.....',
    ]), { '#': C.white });
  },
  react: () => {
    const p = tile('#20232A');
    ring(p, 7, 7, 6, 2.3, 0, '#61DAFB');
    ring(p, 7, 7, 6, 2.3, Math.PI / 3, '#61DAFB');
    ring(p, 7, 7, 6, 2.3, -Math.PI / 3, '#61DAFB');
    p.rect(6, 6, 2, 2, '#61DAFB');
    return p;
  },
  vercel: () => tile('#111111').stamp(1, 4, rows([
    '......##......',
    '.....####.....',
    '....######....',
    '...########...',
    '..##########..',
    '.############.',
  ].map((r) => r.slice(1, 13))), { '#': C.white }),
  python: () => new Px(14, 14).stamp(0, 0, rows([
    '....BBBBB.....',
    '...BwBBBBB....',
    '...BBBBBBB....',
    '......BBBB....',
    '.BBBBBBBBB.YY.',
    'BBBBBBBBBB.YYY',
    'BBBBBBBBB.YYYY',
    'BBBB.YYYYYYYYY',
    'BBB.YYYYYYYYYY',
    '.BB.YYYYYYYYY.',
    '....YYYY......',
    '....YYYYYYY...',
    '....YYYYYwY...',
    '.....YYYYY....',
  ]), { B: '#3776AB', Y: '#FFD43B', w: C.white }),
  figma: () => new Px(14, 14).stamp(2, 0, rows([
    '.RRRROOOO.',
    'RRRRROOOOO',
    'RRRRROOOOO',
    '.RRRROOOO.',
    '.PPPP.BB..',
    'PPPPPBBBB.',
    'PPPPPBBBB.',
    '.PPPP.BB..',
    '.GGGG.....',
    'GGGGG.....',
    'GGGGG.....',
    '.GGGG.....',
    '..GG......',
    '..........',
  ]), { R: '#F24E1E', O: '#FF7262', P: '#A259FF', B: '#1ABCFE', G: '#0ACF83' }),
};

// ── link icons (12×12) ──────────────────────────────────────────────────────
export const LINK_ICONS = {
  globe: () => new Px(12, 12).stamp(0, 0, rows([
    '...oooooo...',
    '..o.o..o.o..',
    '.o.o....o.o.',
    'oooooooooooo',
    'o..o....o..o',
    'o..o....o..o',
    'o..o....o..o',
    'o..o....o..o',
    'oooooooooooo',
    '.o.o....o.o.',
    '..o.o..o.o..',
    '...oooooo...',
  ]), { o: C.ink }),
  instagram: () => new Px(12, 12).stamp(0, 0, rows([
    '.oooooooooo.',
    'o..........o',
    'o........o.o',
    'o...oooo...o',
    'o..o....o..o',
    'o..o....o..o',
    'o..o....o..o',
    'o..o....o..o',
    'o...oooo...o',
    'o..........o',
    'o..........o',
    '.oooooooooo.',
  ]), { o: C.ink }),
  linkedin: () => {
    const p = new Px(12, 12);
    p.rect(1, 0, 10, 12, '#0A66C2').rect(0, 1, 12, 10, '#0A66C2');
    return p.stamp(2, 2, rows([
      '##......',
      '........',
      '##.#.##.',
      '##.##..#',
      '##.#...#',
      '##.#...#',
      '##.#...#',
    ]), { '#': C.white });
  },
  fastwork: () => {
    const p = new Px(12, 12);
    p.rect(1, 0, 10, 12, C.blue).rect(0, 1, 12, 10, C.blue);
    return p.stamp(3, 2, rows([
      '..####',
      '.##...',
      '.##...',
      '#####.',
      '.##...',
      '.##...',
      '.##...',
      '.##...',
    ]), { '#': C.white });
  },
};

// ── hobby icons (16×16) ─────────────────────────────────────────────────────
const GEAR = { o: C.ink, s: C.orange, S: C.orangeDeep, w: C.white, g: C.curb, k: C.ink, b: C.blue, B: C.sky, m: '#C9D3E0', y: C.yellow, r: C.red };

export const HOBBY = {
  slalom: () => new Px(18, 16).stamp(0, 0, rows([
    '..ooooo...........',
    '..osssoo..........',
    '..osssso..........',
    '..oswsso..........',
    '..osssso..........',
    '..oSSSSoo.........',
    '..osssssoo........',
    '..ossssssooo......',
    '..osssssssssoo....',
    '..oSSSSSSSSSSSo...',
    '..ooooooooooooo...',
    '...omo..omo..omo..',
    '..okgko.kgko.kgko.',
    '..okkko.kkko.kkko.',
    '...ooo...ooo..ooo.',
    '..................',
  ]), GEAR),
  ice: () => new Px(18, 16).stamp(0, 0, rows([
    '..ooooo...........',
    '..owwwoo..........',
    '..owbwwo..........',
    '..owwbwo..........',
    '..owbwwo..........',
    '..owwwwoo.........',
    '..owwwwwoo........',
    '..owwwwwwooo......',
    '..owwwwwwwwwoo....',
    '..oBBBBBBBBBBBo...',
    '..ooooooooooooo...',
    '....om....om......',
    '....om....om......',
    '.ooommmmmmmmmmo...',
    '..ooooooooooooo...',
    '..................',
  ]), GEAR),
  rollerski: () => new Px(18, 16).stamp(0, 0, rows([
    '...............o..',
    '..............om..',
    '.............om...',
    '............om....',
    '...........om.....',
    '..........om......',
    '.........om.......',
    '....ooooom........',
    '....obbbo.........',
    '....obwbbo........',
    '....obbbbboo......',
    '....oBBBBBBBo.....',
    '.oooooooooooooooo.',
    'okgko........okgko',
    'okkko........okkko',
    '.ooo..........ooo.',
  ]), GEAR),
};
