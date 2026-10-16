// Link buttons under the header. The README wraps each image in its link.
import { pixelText } from '../lib/pixel.mjs';
import { LINK_ICONS } from '../lib/sprites.mjs';
import { doc, text } from '../lib/svg.mjs';
import { C } from '../lib/theme.mjs';

export function links({ icon, label, handle }) {
  const W = 220;
  const H = 72;
  const art = LINK_ICONS[icon]();
  const body = `<rect class="smooth" x="7" y="9" width="208" height="58" rx="14" fill="${C.shadow}"/>
<rect class="smooth" x="2" y="4" width="208" height="58" rx="14" fill="${C.paper}" stroke="${C.ink}" stroke-width="3"/>
<rect class="smooth" x="12" y="13" width="40" height="40" rx="10" fill="${C.mist}" stroke="${C.ink}" stroke-width="2"/>
${art.svg(32 - art.w * 1.5, 33 - art.h * 1.5, 3)}
${pixelText(label, { x: 64, y: 16, size: 2, fill: C.blue }).svg}
${text(handle, { x: 64, y: 47, size: 14, weight: 600 })}`;
  return doc(W, H, { title: `${label.toLowerCase()} — ${handle}`, desc: `${label}: ${handle}`, body });
}
