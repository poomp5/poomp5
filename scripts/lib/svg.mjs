// SVG building blocks shared by every card.
import { pixelText, round } from './pixel.mjs';
import { C, MONO } from './theme.mjs';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function doc(w, h, { title, desc, style = '', defs = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc" shape-rendering="crispEdges">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<style>
.mono { font-family: ${MONO}; }
.smooth { shape-rendering: geometricPrecision; }
${style}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
</style>
<defs>${DOTS}${defs}</defs>
${body}
</svg>
`;
}

const DOTS = `<pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><rect x="9" y="9" width="2" height="2" fill="${C.dot}" opacity=".7"/></pattern>`;

// Paper panel with a hard drop shadow, like a sticker on graph paper.
export function panel(x, y, w, h, { fill = C.paper, r = 18, dots = true, shadow = 7 } = {}) {
  return `<g class="smooth"><rect x="${x + shadow}" y="${y + shadow}" width="${w}" height="${h}" rx="${r}" fill="${C.shadow}"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>
${dots ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#dots)"/>` : ''}
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${C.ink}" stroke-width="3"/></g>`;
}

// Title tab sitting on a panel's top edge.
export function tab(x, y, text, { fill = C.blue, color = C.paper, size = 3 } = {}) {
  const pad = 14;
  const label = pixelText(text, { x: x + pad, y: y + 9, size, fill: color });
  const w = label.width + pad * 2;
  const h = 7 * size + 18;
  return `<rect class="smooth" x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="${C.ink}" stroke-width="3"/>${label.svg}`;
}

export function text(str, { x, y, size = 16, fill = C.ink, weight = 400, anchor = 'start', attrs = '' }) {
  return `<text class="mono" x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${attrs}>${esc(str)}</text>`;
}

// Rough width of monospace text — system monospace fonts sit between 0.55 and 0.62 em.
export const monoWidth = (str, size) => [...str].length * size * 0.61;

// A small rounded label.
export function chip(str, { x, y, fill = C.mist, color = C.ink, size = 12, stroke = C.ink }) {
  const w = Math.ceil(monoWidth(str, size) + 16);
  const h = size + 10;
  return {
    svg: `<rect class="smooth" x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>${text(str, { x: x + w / 2, y: y + h / 2 + size * 0.36, size, fill: color, anchor: 'middle', weight: 600 })}`,
    width: w,
  };
}

export const drift = (len, dur, dir = -1) =>
  `<animateTransform attributeName="transform" type="translate" from="0 0" to="${dir * len} 0" dur="${dur}s" repeatCount="indefinite"/>`;

// Step through `values`, giving each the same share of `dur`.
export function cycle(attr, values, dur, { type, additive } = {}) {
  const kt = values.map((_, i) => round(i / values.length)).join(';');
  const tag = type ? 'animateTransform' : 'animate';
  return `<${tag} attributeName="${attr}"${type ? ` type="${type}"` : ''}${additive ? ' additive="sum"' : ''} values="${values.join(';')}" keyTimes="${kt}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/>`;
}

// Show something only during slot `i` of `n` in a `dur`-second loop.
export function slot(i, n, dur) {
  const values = [];
  const times = [];
  for (let k = 0; k < n; k++) {
    times.push(round(k / n));
    values.push(k === i ? 1 : 0);
  }
  return `<animate attributeName="opacity" values="${values.join(';')}" keyTimes="${times.join(';')}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/>`;
}

// A gentle up/down bob.
export const bob = (amp, dur, delay = 0) =>
  `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${-amp};0 0" keyTimes="0;.5;1" dur="${dur}s" begin="${delay}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>`;
