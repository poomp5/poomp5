// The banner: name, typewriter, the season's sky over a Bangkok skyline, and the
// cat slaloming through cones. Redrawn daily so the season and birthday flip on time.
import { pixelText, round, textStops } from '../lib/pixel.mjs';
import { bird, cat, cloud, cone, sparkle, skyline, sun } from '../lib/sprites.mjs';
import { cycle, doc, esc } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';

const W = 900;
const H = 320;
const X0 = 2;
const Y0 = 2;
const PW = 890;
const PH = 308;
const ROAD = 238; // top of the curb

const SEASONS = {
  cool: { label: 'COOL SEASON', sky: ['#C9E3FF', '#F4F8FD'], far: '#D3E4F7', farLight: '#E8F1FB' },
  hot: { label: 'HOT SEASON', sky: ['#FFE2B8', '#FFF7EA'], far: '#F6D9C2', farLight: '#FBEADB' },
  rainy: { label: 'RAINY SEASON', sky: ['#BCCBE0', '#E4EBF4'], far: '#B4C5DC', farLight: '#CCD8E8' },
};

// ── typewriter ──────────────────────────────────────────────────────────────
function typewriter(lines, { x, y, size }) {
  const TYPE = 0.075;
  const HOLD = 2.4;
  const ERASE = 0.03;
  const GAP = 0.35;
  const plan = lines.map((line) => {
    const stops = textStops(line).map((s) => s * size);
    const n = [...line].length;
    return { line, stops, n, dur: n * TYPE + HOLD + n * ERASE + GAP };
  });
  const total = plan.reduce((t, p) => t + p.dur, 0);
  const kt = (t) => Math.min(1, t / total).toFixed(4);

  let svg = '';
  let start = 0;
  const cursor = []; // [time, x]
  plan.forEach((p, i) => {
    const frames = [[0, 0]];
    let t = start;
    for (let k = 1; k <= p.n; k++) frames.push([t + k * TYPE, p.stops[k]]);
    t += p.n * TYPE + HOLD;
    for (let k = p.n - 1; k >= 0; k--) frames.push([t + (p.n - k) * ERASE, p.stops[k]]);
    frames.push([start + p.dur, 0]);
    if (start > 0) frames.splice(1, 0, [start, 0]);
    frames.forEach(([ft, fx]) => cursor.push([ft, fx]));

    const values = frames.map(([, w]) => w + (w ? size : 0)).join(';');
    const times = frames.map(([ft]) => kt(ft)).join(';');
    svg += `<clipPath id="tw${i}"><rect x="${x}" y="${y - size * 2}" width="0" height="${size * 12}"><animate attributeName="width" values="${values}" keyTimes="${times}" dur="${round(total)}s" calcMode="discrete" repeatCount="indefinite"/></rect></clipPath>`;
    svg += `<g clip-path="url(#tw${i})">${pixelText(p.line, { x, y, size, fill: C.ink }).svg}</g>`;
    start += p.dur;
  });

  cursor.sort((a, b) => a[0] - b[0]);
  const cx = cursor.map(([, cxv]) => x + cxv + (cxv ? size * 2 : 0)).join(';');
  const ct = cursor.map(([t]) => kt(t)).join(';');
  svg += `<rect x="${x}" y="${y - size}" width="${size * 3}" height="${size * 9}" fill="${C.blue}"><animate attributeName="x" values="${cx}" keyTimes="${ct}" dur="${round(total)}s" calcMode="discrete" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1s" calcMode="discrete" repeatCount="indefinite"/></rect>`;
  return svg;
}

// ── weather ─────────────────────────────────────────────────────────────────
function clouds(season) {
  const tint = season === 'rainy' ? ['#EEF2F8', '#D3DCE8'] : [C.white, C.mist];
  const spots = season === 'rainy'
    ? [[40, 20, 4], [300, 8, 5], [560, 26, 4], [760, 6, 5]]
    : season === 'hot' ? [[420, 30, 3], [610, 60, 2]] : [[380, 28, 3], [620, 70, 2], [140, 120, 2], [820, 40, 3]];
  const one = (dx) => spots.map(([x, y, s]) => cloud(...tint).svg(x + dx, y, s)).join('');
  const dur = season === 'rainy' ? 70 : 140;
  return `<g opacity="${season === 'rainy' ? 0.95 : 0.9}"><g>${one(0)}${one(1000)}<animateTransform attributeName="transform" type="translate" from="0 0" to="-1000 0" dur="${dur}s" repeatCount="indefinite"/></g></g>`;
}

function rain() {
  const drops = [[4, 0], [22, 26], [13, 44], [33, 12]].map(([x, y]) => `<rect x="${x}" y="${y}" width="2" height="9" fill="${C.sky}" opacity=".75"/>`).join('');
  return `<pattern id="rain" width="40" height="60" patternUnits="userSpaceOnUse">${drops}</pattern>
<g><rect x="-40" y="-60" width="${W + 80}" height="${ROAD + 60}" fill="url(#rain)"/><animateTransform attributeName="transform" type="translate" values="6 -60;0 0" dur=".45s" repeatCount="indefinite"/></g>`;
}

function weather(season) {
  if (season === 'hot') {
    const s = sun(16);
    return `<g><circle class="smooth" cx="720" cy="104" r="70" fill="#FFD27A" opacity=".35"><animate attributeName="r" values="62;74;62" dur="4s" repeatCount="indefinite"/></circle>${s.svg(720 - 17 * 4, 104 - 17 * 4, 4)}</g>${clouds(season)}`;
  }
  if (season === 'rainy') return clouds(season);
  const flap = (x, y) => `<g>${bird(0).svg(x, y, 3)}${cycle('opacity', [1, 0], 0.7)}</g><g opacity="0">${bird(1).svg(x, y, 3)}${cycle('opacity', [0, 1], 0.7)}</g>`;
  const birds = `<g>${flap(0, 0)}<g transform="translate(26 14)">${flap(0, 0)}</g><animateTransform attributeName="transform" type="translate" from="${W + 40} 70" to="-120 40" dur="38s" repeatCount="indefinite"/></g>`;
  return `${sun(9).svg(668, 52, 4)}${clouds(season)}${birds}`;
}

// ── the road and the slalom ─────────────────────────────────────────────────
function road(season) {
  const dash = `<pattern id="dash" width="64" height="8" patternUnits="userSpaceOnUse"><rect width="32" height="6" fill="${C.paper}" opacity=".85"/></pattern>`;
  let svg = `${dash}<rect x="0" y="${ROAD}" width="${W}" height="8" fill="${C.curb}"/>
<rect x="0" y="${ROAD + 8}" width="${W}" height="${H - ROAD}" fill="${C.road}"/>
<rect x="0" y="${ROAD + 8}" width="${W}" height="4" fill="${C.roadDark}"/>
<g><rect x="-64" y="${ROAD + 46}" width="${W + 128}" height="6" fill="url(#dash)"/><animateTransform attributeName="transform" type="translate" from="0 0" to="-64 0" dur=".55s" repeatCount="indefinite"/></g>`;
  if (season === 'rainy') {
    svg += [[140, 268], [470, 296], [800, 262]].map(([x, y], i) => `<ellipse class="smooth" cx="${x}" cy="${y}" rx="6" ry="2" fill="none" stroke="${C.pale}" stroke-width="2"><animate attributeName="rx" values="4;22" dur="1.4s" begin="${i * 0.45}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="1.4s" begin="${i * 0.45}s" repeatCount="indefinite"/></ellipse>`).join('');
  }
  return svg;
}

function slalom() {
  const S = 4;
  const GAP = 180; // between cones
  const T = 1.6; // seconds per cone
  const CX = 690; // cat centre
  const LANE = 292; // where cones stand
  const c = cone();
  const coneW = c.w * S;
  const cones = [];
  for (let x = CX - GAP * 4; x <= W + GAP; x += GAP) cones.push(c.svg(x - coneW / 2, LANE - c.h * S, S));
  const coneRow = `<g>${cones.join('')}<animateTransform attributeName="transform" type="translate" from="0 0" to="${-GAP} 0" dur="${T}s" repeatCount="indefinite"/></g>`;

  // two frames of skating legs
  const kitty = (dy) => {
    const f0 = cat(0).svg(CX - 14 * S, LANE - 25 * S + dy, S);
    const f1 = cat(1).svg(CX - 14 * S, LANE - 25 * S + dy, S);
    return `<g>${f0}<animate attributeName="opacity" values="1;0" dur=".5s" calcMode="discrete" repeatCount="indefinite"/></g><g opacity="0">${f1}<animate attributeName="opacity" values="0;1" dur=".5s" calcMode="discrete" repeatCount="indefinite"/></g>`;
  };
  // The cat swings in front of one cone and behind the next. Two copies, one on
  // each side of the cones in the drawing order, take turns being visible.
  const A = 9;
  const swing = `<animateTransform attributeName="transform" type="translate" values="0 ${A};0 0;0 ${-A};0 0;0 ${A}" keyTimes="0;.25;.5;.75;1" dur="${T * 2}s" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1" repeatCount="indefinite"/>`;
  const shadowEl = `<ellipse class="smooth" cx="${CX}" cy="${LANE + 2}" rx="40" ry="5" fill="${C.roadDark}" opacity=".6">${swing}</ellipse>`;
  const back = `<g>${swing}<g opacity="0">${kitty(0)}<animate attributeName="opacity" values="0;1;0" keyTimes="0;.25;.75" dur="${T * 2}s" calcMode="discrete" repeatCount="indefinite"/></g></g>`;
  const front = `<g>${swing}<g>${kitty(0)}<animate attributeName="opacity" values="1;0;1" keyTimes="0;.25;.75" dur="${T * 2}s" calcMode="discrete" repeatCount="indefinite"/></g></g>`;
  return `${shadowEl}${back}${coneRow}${front}`;
}

function confetti() {
  const colors = [C.orange, C.pink, C.yellow, C.sky, C.green];
  let svg = '';
  for (let i = 0; i < 28; i++) {
    const x = (i * 137) % 880 + 10;
    const dur = 3 + (i % 5) * 0.6;
    svg += `<rect x="${x}" y="-10" width="6" height="${i % 2 ? 6 : 10}" fill="${colors[i % colors.length]}"><animateTransform attributeName="transform" type="translate" values="0 0;${(i % 3) * 10 - 10} ${ROAD + 20}" dur="${dur}s" begin="${-(i * 0.37) % dur}s" repeatCount="indefinite"/></rect>`;
  }
  return svg;
}

export function header(profile, { season, level }) {
  const s = SEASONS[season];
  const lines = level.isBirthday ? ['happy birthday ♥', `level up! lv.${level.level}`, ...profile.taglines] : profile.taglines;
  const name = pixelText(profile.name, { x: 48, y: 34, size: 12, fill: C.ink, shadow: C.pale });
  const badge = pixelText(s.label, { x: 862, y: 24, size: 2, fill: C.inkSoft, align: 'right' });
  const far = skyline(300, 40, s.far, s.farLight);
  const farRow = `<g>${far.svg(0, ROAD - 120, 3)}${far.svg(900, ROAD - 120, 3)}<animateTransform attributeName="transform" type="translate" from="0 0" to="-900 0" dur="120s" repeatCount="indefinite"/></g>`;
  const sparkles = [[640, 40, C.sky, 0], [600, 150, C.orange, 1.2], [40, 160, C.pink, 2.1]]
    .map(([x, y, col, d]) => `<g opacity="0">${sparkle(col).svg(x, y, 3)}<animate attributeName="opacity" values="0;1;0" dur="3s" begin="${d}s" repeatCount="indefinite"/></g>`).join('');

  const desc = `${profile.name}: a blue pixel cat on inline skates slaloms between traffic cones on a Bangkok street (${s.label.toLowerCase()} sky), while a typewriter cycles: ${lines.join(' / ')}`;

  const body = `<rect x="${X0 + 7}" y="${Y0 + 7}" width="${PW}" height="${PH}" rx="20" fill="${C.shadow}" class="smooth"/>
<g clip-path="url(#card)">
<rect x="0" y="0" width="${W}" height="${H}" fill="url(#sky)"/>
<rect x="0" y="0" width="${W}" height="${ROAD}" fill="url(#dots)" opacity=".5"/>
${weather(season)}
${farRow}
${season === 'rainy' ? rain() : ''}
${road(season)}
${slalom()}
${level.isBirthday ? confetti() : ''}
${sparkles}
${name.svg}
${typewriter(lines, { x: 52, y: 176, size: 4 })}
${badge.svg}
</g>
<rect x="${X0}" y="${Y0}" width="${PW}" height="${PH}" rx="20" fill="none" stroke="${C.ink}" stroke-width="3" class="smooth"/>`;

  return doc(W, H, {
    title: `${profile.name} — ${esc(lines[0])}`,
    desc,
    defs: `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset=".75" stop-color="${s.sky[1]}"/></linearGradient>
<clipPath id="card"><rect x="${X0}" y="${Y0}" width="${PW}" height="${PH}" rx="20"/></clipPath>`,
    body,
  });
}
