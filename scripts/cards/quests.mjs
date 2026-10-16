// Quest log: featured projects with their thumbnails, prize and tags.
import { readFileSync } from 'node:fs';
import { pixelText, round } from '../lib/pixel.mjs';
import { sparkle, trophy } from '../lib/sprites.mjs';
import { chip, doc, panel, tab, text } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';

const W = 900;
const H = 396;

function wrap(str, max) {
  const lines = [''];
  for (const word of str.split(' ')) {
    const cur = lines[lines.length - 1];
    if (!cur) lines[lines.length - 1] = word;
    else if ((cur + ' ' + word).length <= max) lines[lines.length - 1] = `${cur} ${word}`;
    else lines.push(word);
  }
  return lines;
}

function card(q, x, y, w, i) {
  const pad = 10;
  const tw = w - pad * 2;
  const th = Math.round((tw * 3) / 4);
  const art = readFileSync(new URL(`../../assets/art/${q.art}`, import.meta.url)).toString('base64');
  let svg = `<rect class="smooth" x="${x}" y="${y}" width="${w}" height="300" rx="14" fill="${C.white}" stroke="${C.ink}" stroke-width="3"/>
<clipPath id="thumb${i}"><rect x="${x + pad}" y="${y + pad}" width="${tw}" height="${th}" rx="8"/></clipPath>
<image href="data:image/webp;base64,${art}" x="${x + pad}" y="${y + pad}" width="${tw}" height="${th}" preserveAspectRatio="xMidYMid slice" clip-path="url(#thumb${i})"/>
<rect class="smooth" x="${x + pad}" y="${y + pad}" width="${tw}" height="${th}" rx="8" fill="none" stroke="${C.ink}" stroke-width="2"/>`;

  // prize ribbon across the bottom edge of the thumbnail
  const prize = pixelText(q.prize, { x: 0, y: 0, size: 2, fill: C.ink });
  const rw = prize.width + 44;
  const ry = y + pad + th - 12;
  const t = trophy();
  svg += `<rect class="smooth" x="${x + pad + 6}" y="${ry}" width="${rw}" height="26" rx="7" fill="${C.yellow}" stroke="${C.ink}" stroke-width="2.5"/>
${t.svg(x + pad + 13, ry + 5, 1.15)}
${pixelText(q.prize, { x: x + pad + 36, y: ry + 6, size: 2, fill: C.ink }).svg}`;

  const ty = y + pad + th + 40;
  svg += text(q.title, { x: x + pad, y: ty, size: 18, weight: 700 });
  // year tag in the thumbnail's top-right corner
  const yr = pixelText(q.year, { x: 0, y: 0, size: 2, fill: C.ink });
  const yw = yr.width + 16;
  svg += `<rect class="smooth" x="${x + w - pad - yw - 6}" y="${y + pad + 6}" width="${yw}" height="22" rx="6" fill="${C.white}" stroke="${C.ink}" stroke-width="2"/>${pixelText(q.year, { x: x + w - pad - yw - 6 + 8, y: y + pad + 10, size: 2, fill: C.ink }).svg}`;
  wrap(q.what, 22).slice(0, 2).forEach((line, k) => {
    svg += text(line, { x: x + pad, y: ty + 22 + k * 17, size: 13, fill: C.inkSoft });
  });
  svg += text(`@ ${q.where}`, { x: x + pad, y: ty + 64, size: 12, fill: C.blue, weight: 600 });
  let cx = x + pad;
  for (const tag of q.tags) {
    const c = chip(tag, { x: cx, y: ty + 76, size: 11 });
    svg += c.svg;
    cx += c.width + 6;
  }
  return svg;
}

export function quests(profile) {
  const n = profile.quests.length;
  const x0 = 26;
  const gap = 14;
  const w = (862 - x0 - gap * (n - 1)) / n;
  const y = 66;
  let cards = '';
  profile.quests.forEach((q, i) => { cards += card(q, x0 + i * (w + gap), y, w, i); });

  // a selection frame hopping between the cards
  const dur = 2.4;
  const xs = profile.quests.map((_, i) => `${round(x0 + i * (w + gap) - 6)} 0`).join(';');
  const kt = profile.quests.map((_, i) => round(i / n)).join(';');
  const cursor = `<g><rect class="smooth" x="0" y="${y - 6}" width="${w + 12}" height="312" rx="18" fill="none" stroke="${C.orange}" stroke-width="4"/><g>${sparkle(C.orange).svg(w - 4, y - 14, 3)}<animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite"/></g><animateTransform attributeName="transform" type="translate" values="${xs}" keyTimes="${kt}" dur="${dur * n}s" calcMode="discrete" repeatCount="indefinite"/></g>`;

  const body = `${panel(2, 24, 888, H - 34)}
${tab(24, 4, 'QUEST LOG')}
${text(profile.moreQuests, { x: 862, y: 50, size: 13, fill: C.inkSoft, anchor: 'end' })}
${cards}
${cursor}`;
  const desc = `Quest log — ${profile.quests.map((q) => `${q.title} (${q.year}): ${q.what}, ${q.prize.toLowerCase()} at ${q.where}`).join('; ')}`;
  return doc(W, H, { title: `${profile.name} — quest log`, desc, body });
}
