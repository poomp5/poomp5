// Character sheet: avatar, class/guild/school, level (= age) with an XP bar that
// fills towards the next birthday, and an inventory of tools. Redrawn daily.
import { pixelText, round } from '../lib/pixel.mjs';
import { ICONS, cake, catFace, sparkle } from '../lib/sprites.mjs';
import { bob, doc, panel, slot, tab, text } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';

const W = 900;
const H = 362;
const COL = 296; // label column
const VAL = 430; // value column

const dashed = (y) => `<line x1="${COL}" y1="${y}" x2="862" y2="${y}" stroke="${C.dot}" stroke-width="2" stroke-dasharray="6 6"/>`;

function avatar(profile, level) {
  const x = 34;
  const y = 62;
  const w = 226;
  const h = 260;
  const face = catFace();
  const S = 7;
  const fx = x + (w - face.w * S) / 2;
  const plate = pixelText(profile.name, { x: x + w / 2, y: y + 168, size: 4, fill: C.ink, align: 'center' });
  const day = new Date(`${profile.birthday}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).toUpperCase();
  const bday = pixelText(day, { x: x + 96, y: y + 223, size: 3, fill: C.inkSoft });
  const c = cake();
  return `<rect class="smooth" x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="url(#avatarSky)" stroke="${C.ink}" stroke-width="3"/>
<ellipse class="smooth" cx="${x + w / 2}" cy="${y + 140}" rx="64" ry="7" fill="${C.pale}"/>
<g>${face.svg(fx, y + 22, S)}${bob(6, 2.6)}</g>
<g opacity="0">${sparkle(C.yellow).svg(x + 186, y + 22, 3)}<animate attributeName="opacity" values="0;1;0" dur="2.6s" repeatCount="indefinite"/></g>
${plate.svg}
<line x1="${x + 22}" y1="${y + 207}" x2="${x + w - 22}" y2="${y + 207}" stroke="${C.pale}" stroke-width="2" stroke-dasharray="5 5"/>
${c.svg(x + 52, y + 218, 3)}${bday.svg}
${level.isBirthday ? pixelText('LEVEL UP!', { x: x + w / 2, y: y + 8, size: 2, fill: C.orangeDeep, align: 'center' }).svg : ''}`;
}

function row(label, value, y) {
  return `${pixelText(label, { x: COL, y, size: 3, fill: C.inkSoft }).svg}${text(value, { x: VAL, y: y + 18, size: 19 })}`;
}

function levelRow(level, y) {
  const lv = pixelText(`LV.${level.level}`, { x: VAL, y, size: 4, fill: C.blue });
  const bx = VAL + lv.width + 22;
  const bw = 862 - bx;
  const fill = Math.max(10, Math.round((bw - 6) * level.xp));
  const days = Math.round(level.daysLeft);
  const note = level.isBirthday ? 'just levelled up today ✦' : `lv.${level.level + 1} in ${days} day${days === 1 ? '' : 's'} · birthday xp`;
  return `${pixelText('LEVEL', { x: COL, y: y + 2, size: 3, fill: C.inkSoft }).svg}${lv.svg}
<rect class="smooth" x="${bx}" y="${y}" width="${bw}" height="20" rx="10" fill="${C.paperDeep}" stroke="${C.ink}" stroke-width="3"/>
<clipPath id="xp"><rect x="${bx + 3}" y="${y + 3}" width="${fill}" height="14" rx="7"/></clipPath>
<g clip-path="url(#xp)"><rect x="${bx}" y="${y}" width="${bw}" height="20" fill="${C.sky}"/><g><rect x="${bx - 20}" y="${y}" width="${bw + 40}" height="20" fill="url(#stripes)"/><animateTransform attributeName="transform" type="translate" from="0 0" to="20 0" dur="1s" repeatCount="indefinite"/></g></g>
${text(note, { x: bx, y: y + 40, size: 13, fill: C.inkSoft })}
${text(`${Math.round(level.xp * 100)}%`, { x: 862, y: y + 40, size: 13, fill: C.blue, weight: 700, anchor: 'end' })}`;
}

function inventory(items, y) {
  const S = 56;
  const G = 12;
  const dur = 2;
  const total = dur * items.length;
  let svg = pixelText('INVENTORY', { x: COL, y, size: 3, fill: C.inkSoft }).svg;
  const top = y + 32;
  items.forEach(([icon, label], i) => {
    const x = COL + i * (S + G);
    const art = ICONS[icon]();
    svg += `<rect class="smooth" x="${x}" y="${top}" width="${S}" height="${S}" rx="12" fill="${C.paper}" stroke="${C.ink}" stroke-width="3"/>${art.svg(x + (S - art.w * 3) / 2, top + (S - art.h * 3) / 2, 3)}`;
  });
  // cursor hopping from slot to slot
  const xs = items.map((_, i) => COL + i * (S + G) - 6);
  const kt = items.map((_, i) => round(i / items.length)).join(';');
  svg += `<g><rect class="smooth" x="0" y="${top - 6}" width="${S + 12}" height="${S + 12}" rx="16" fill="none" stroke="${C.orange}" stroke-width="4"/><animateTransform attributeName="transform" type="translate" values="${xs.map((x) => `${x} 0`).join(';')}" keyTimes="${kt}" dur="${total}s" calcMode="discrete" repeatCount="indefinite"/></g>`;
  // speech bubble naming the selected item
  const bx = COL + items.length * (S + G) + 14;
  const bw = 862 - bx;
  svg += `<path class="smooth" d="M${bx} ${top + S / 2 - 8}l-12 8l12 8z" fill="${C.white}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>
<rect class="smooth" x="${bx}" y="${top + 6}" width="${bw}" height="${S - 12}" rx="12" fill="${C.white}" stroke="${C.ink}" stroke-width="3"/>
<rect x="${bx - 1}" y="${top + S / 2 - 6}" width="5" height="12" fill="${C.white}"/>`;
  items.forEach(([, label], i) => {
    svg += `<g opacity="0">${text(label, { x: bx + bw / 2, y: top + S / 2 + 6, size: 16, anchor: 'middle', weight: 600 })}${slot(i, items.length, total)}</g>`;
  });
  return svg;
}

export function status(profile, { level }) {
  const body = `${panel(2, 24, 888, 328)}
${tab(24, 4, 'STATUS')}
${avatar(profile, level)}
${row(profile.status[0][0], profile.status[0][1], 58)}${dashed(92)}
${row(profile.status[1][0], profile.status[1][1], 104)}${dashed(138)}
${row(profile.status[2][0], profile.status[2][1], 150)}${dashed(184)}
${levelRow(level, 196)}
${inventory(profile.inventory, 252)}`;

  const desc = `Status — ${profile.status.map(([k, v]) => `${k.toLowerCase()}: ${v}`).join(' · ')} · level ${level.level} (${Math.round(level.xp * 100)}% of the way to the next birthday) · inventory: ${profile.inventory.map(([, l]) => l).join(', ')}`;
  return doc(W, H, {
    title: `${profile.name} — status`,
    desc,
    defs: `<linearGradient id="avatarSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE6FF"/><stop offset="1" stop-color="${C.mist}"/></linearGradient>
<pattern id="stripes" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)"><rect width="10" height="20" fill="${C.blue}" opacity=".35"/></pattern>`,
    body,
  });
}
