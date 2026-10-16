// The two half-width cards: hobbies ("side quests") and numbers ("save file").
import { Px, pixelText, round } from '../lib/pixel.mjs';
import { HOBBY, heart, sparkle, trophy } from '../lib/sprites.mjs';
import { doc, panel, slot, tab, text } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';

const W = 440;
const H = 300;

export function hobbies(profile) {
  const list = profile.hobbies;
  const dur = 2.2;
  let rows = '';
  list.forEach(([icon, name, note], i) => {
    const y = 62 + i * 74;
    const art = HOBBY[icon]();
    rows += `<rect class="smooth" x="26" y="${y}" width="66" height="60" rx="12" fill="${C.mist}" stroke="${C.ink}" stroke-width="3"/>
<g>${art.svg(59 - art.w * 1.5, y + 30 - art.h * 1.5, 3)}<animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="${dur * list.length}s" begin="${i * dur}s" keyTimes="0;.05;.1" repeatCount="indefinite"/></g>
${pixelText(name, { x: 110, y: y + 12, size: 3, fill: C.ink }).svg}
${text(note, { x: 110, y: y + 50, size: 14, fill: C.inkSoft })}`;
    rows += `<g opacity="0">${sparkle(C.orange).svg(392, y + 22, 2)}${slot(i, list.length, dur * list.length)}</g>`;
  });
  const body = `${panel(2, 24, 428, H - 34)}
${tab(24, 4, 'SIDE QUESTS')}
${rows}`;
  return doc(W, H, {
    title: `${profile.name} — side quests`,
    desc: `Side quests (hobbies) — ${list.map(([, n, d]) => `${n.toLowerCase()}: ${d}`).join('; ')}`,
    body,
  });
}

function play() {
  return new Px(9, 9).stamp(0, 0, [
    '.#######.',
    '#########',
    '###.#####',
    '###..####',
    '###...###',
    '###..####',
    '###.#####',
    '#########',
    '.#######.',
  ], { '#': C.red });
}

export function stats(profile) {
  const icons = [() => trophy(), () => sparkle(C.sky), () => heart(C.pink), () => play()];
  const scale = [2, 3, 3, 2.4];
  let tiles = '';
  profile.stats.forEach(([value, label], i) => {
    const x = 24 + (i % 2) * 200;
    const y = 58 + Math.floor(i / 2) * 110;
    const art = icons[i % icons.length]();
    tiles += `<rect class="smooth" x="${x}" y="${y}" width="184" height="96" rx="14" fill="${C.white}" stroke="${C.ink}" stroke-width="3"/>
<g>${art.svg(x + 184 - 14 - art.w * scale[i], y + 14, scale[i])}<animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="2.4s" begin="${round(i * 0.6)}s" repeatCount="indefinite"/></g>
${pixelText(value, { x: x + 16, y: y + 22, size: 4, fill: C.blue }).svg}
${text(label, { x: x + 16, y: y + 78, size: 13, fill: C.inkSoft })}`;
  });
  const body = `${panel(2, 24, 428, H - 34)}
${tab(24, 4, 'SAVE FILE')}
${tiles}`;
  return doc(W, H, {
    title: `${profile.name} — save file`,
    desc: `Save file — ${profile.stats.map(([v, l]) => `${v} ${l}`).join(' · ')}`,
    body,
  });
}
