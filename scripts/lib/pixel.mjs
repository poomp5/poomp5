// A tiny pixel canvas plus a 5×7 bitmap font. Everything is drawn into a grid
// and then written out as one <path> per colour, which keeps the SVGs small.

export const round = (n) => Math.round(n * 100) / 100;

export class Px {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.cells = new Array(w * h).fill(null);
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.cells[y * this.w + x];
  }

  set(x, y, color) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
    this.cells[y * this.w + x] = color;
    return this;
  }

  rect(x, y, w, h, color) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, color);
    return this;
  }

  ellipse(cx, cy, rx, ry, color) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, color);
      }
    }
    return this;
  }

  // Draw ASCII art: each character is looked up in `map`; '.' and ' ' are transparent.
  stamp(x, y, rows, map) {
    rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        if (ch === '.' || ch === ' ') return;
        const color = map[ch];
        if (color === undefined) throw new Error(`no colour for '${ch}'`);
        if (color) this.set(x + i, y + j, color);
      });
    });
    return this;
  }

  // Swap one colour for another wherever `where(x, y)` holds.
  recolor(from, to, where = () => true) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) if (this.get(x, y) === from && where(x, y)) this.set(x, y, to);
    }
    return this;
  }

  // A copy one pixel bigger on every side, with a 1px outline around the shape.
  outline(color) {
    const out = new Px(this.w + 2, this.h + 2);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.get(x, y)) out.set(x + 1, y + 1, this.get(x, y));
    for (let y = 0; y < out.h; y++) {
      for (let x = 0; x < out.w; x++) {
        if (out.get(x, y)) continue;
        const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
          const c = this.get(x + dx - 1, y + dy - 1);
          return c && c !== color;
        });
        if (near) out.set(x, y, color);
      }
    }
    return out;
  }

  flip() {
    const out = new Px(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) out.set(this.w - 1 - x, y, this.get(x, y));
    return out;
  }

  // Paste another canvas on top of this one.
  paste(other, x, y) {
    for (let j = 0; j < other.h; j++) for (let i = 0; i < other.w; i++) if (other.get(i, j)) this.set(x + i, y + j, other.get(i, j));
    return this;
  }

  // One <path> per colour. Horizontal runs are merged, then identical runs on
  // consecutive rows are merged into taller rectangles.
  svg(x = 0, y = 0, s = 1, attrs = '') {
    const open = new Map();
    const done = [];
    for (let row = 0; row <= this.h; row++) {
      const runs = new Map();
      if (row < this.h) {
        let col = 0;
        while (col < this.w) {
          const c = this.get(col, row);
          if (!c) { col++; continue; }
          let end = col;
          while (end + 1 < this.w && this.get(end + 1, row) === c) end++;
          runs.set(`${col},${end - col + 1},${c}`, { x: col, w: end - col + 1, c });
          col = end + 1;
        }
      }
      for (const [key, r] of open) {
        if (runs.has(key)) { r.h++; runs.delete(key); } else { done.push(r); open.delete(key); }
      }
      for (const [key, r] of runs) open.set(key, { ...r, y: row, h: 1 });
    }
    const byColor = new Map();
    for (const r of done) {
      const d = `M${round(x + r.x * s)} ${round(y + r.y * s)}h${round(r.w * s)}v${round(r.h * s)}h${round(-r.w * s)}z`;
      byColor.set(r.c, (byColor.get(r.c) || '') + d);
    }
    return [...byColor].map(([c, d]) => `<path fill="${c}" d="${d}"${attrs}/>`).join('');
  }
}

// ── 5×7 font (lowercase gets two extra rows for descenders) ──────────────────
const G = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
  J: ['..###', '...#.', '...#.', '...#.', '#..#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  a: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'],
  b: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '####.'],
  c: ['.....', '.....', '.###.', '#....', '#....', '#....', '.###.'],
  d: ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####'],
  e: ['.....', '.....', '.###.', '#...#', '#####', '#....', '.###.'],
  f: ['..##', '.#..', '####', '.#..', '.#..', '.#..', '.#..'],
  g: ['.....', '.....', '.####', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
  h: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#'],
  i: ['.#.', '...', '##.', '.#.', '.#.', '.#.', '###'],
  j: ['...#', '....', '..##', '...#', '...#', '...#', '...#', '#..#', '.##.'],
  k: ['#...', '#...', '#..#', '#.#.', '##..', '#.#.', '#..#'],
  l: ['##.', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
  m: ['.....', '.....', '##.#.', '#.#.#', '#.#.#', '#.#.#', '#.#.#'],
  n: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '#...#'],
  o: ['.....', '.....', '.###.', '#...#', '#...#', '#...#', '.###.'],
  p: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '####.', '#....', '#....'],
  q: ['.....', '.....', '.####', '#...#', '#...#', '#...#', '.####', '....#', '....#'],
  r: ['....', '....', '#.##', '##..', '#...', '#...', '#...'],
  s: ['.....', '.....', '.####', '#....', '.###.', '....#', '####.'],
  t: ['.#..', '.#..', '####', '.#..', '.#..', '.#..', '..##'],
  u: ['.....', '.....', '#...#', '#...#', '#...#', '#...#', '.####'],
  v: ['.....', '.....', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  w: ['.....', '.....', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  x: ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  y: ['.....', '.....', '#...#', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
  z: ['.....', '.....', '#####', '...#.', '..#..', '.#...', '#####'],
  ' ': ['...'],
  '.': ['.', '.', '.', '.', '.', '.', '#'],
  ',': ['..', '..', '..', '..', '..', '..', '.#', '#.'],
  '!': ['#', '#', '#', '#', '#', '.', '#'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  ':': ['.', '.', '#', '.', '.', '#', '.'],
  "'": ['#', '#'],
  '-': ['....', '....', '....', '####'],
  _: ['.....', '.....', '.....', '.....', '.....', '.....', '.....', '#####'],
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'],
  '&': ['.##..', '#..#.', '#.#..', '.#...', '#.#.#', '#..#.', '.##.#'],
  '@': ['.###.', '#...#', '#.###', '#.#.#', '#.###', '#....', '.###.'],
  '#': ['.#.#.', '.#.#.', '#####', '.#.#.', '#####', '.#.#.', '.#.#.'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..'],
  '(': ['..#', '.#.', '#..', '#..', '#..', '.#.', '..#'],
  ')': ['#..', '.#.', '..#', '..#', '..#', '.#.', '#..'],
  '~': ['.....', '.....', '.#...', '#.#.#', '...#.'],
  '·': ['.', '.', '.', '#'],
  '%': ['##..#', '##..#', '...#.', '..#..', '.#...', '#..##', '#..##'],
  '>': ['#...', '.#..', '..#.', '...#', '..#.', '.#..', '#...'],
  '<': ['...#', '..#.', '.#..', '#...', '.#..', '..#.', '...#'],
  '=': ['....', '....', '####', '....', '####'],
  '✦': ['.....', '..#..', '.###.', '#####', '.###.', '..#..'],
  '♥': ['.....', '.#.#.', '#####', '#####', '.###.', '..#..'],
  '♪': ['..##.', '..#.#', '..#..', '..#..', '###..', '###..'],
  '★': ['..#..', '..#..', '#####', '.###.', '.#.#.', '#...#'],
};

export const glyph = (ch) => G[ch] || G[ch.toUpperCase()] || G['?'];
export const glyphWidth = (ch) => glyph(ch)[0].length;

// Width in font pixels (1px gap between letters).
export function textCols(str) {
  const chars = [...str];
  return chars.reduce((n, ch) => n + glyphWidth(ch), 0) + Math.max(0, chars.length - 1);
}

// The x offset (in font pixels) after each character — the typewriter uses this.
export function textStops(str) {
  const stops = [0];
  let x = 0;
  for (const ch of str) {
    x += glyphWidth(ch) + 1;
    stops.push(x - 1);
  }
  return stops;
}

export function textPx(str, color) {
  const px = new Px(Math.max(1, textCols(str)), 9);
  let x = 0;
  for (const ch of str) {
    px.stamp(x, 0, glyph(ch), { '#': color });
    x += glyphWidth(ch) + 1;
  }
  return px;
}

// Pixel text. `y` is the top of the capitals; `size` is the size of one font pixel.
// Returns { svg, width, height }.
export function pixelText(str, { x = 0, y = 0, size = 3, fill, shadow, shadowOffset = 1, align = 'left', attrs = '' }) {
  const px = textPx(str, fill);
  const width = textCols(str) * size;
  const left = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;
  let svg = '';
  if (shadow) svg += textPx(str, shadow).svg(left + shadowOffset * size, y + shadowOffset * size, size);
  svg += px.svg(left, y, size, attrs);
  return { svg, width, height: 7 * size, left };
}
