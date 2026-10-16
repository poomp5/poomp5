// Skate log: the last year of GitHub contributions, with the cat skating along
// the top and a highlight sweeping the column underneath it. Redrawn daily.
import { pixelText, round } from '../lib/pixel.mjs';
import { cat, cone } from '../lib/sprites.mjs';
import { cycle, doc, panel, tab, text } from '../lib/svg.mjs';
import { C, LEVELS } from '../lib/theme.mjs';
import { addDays, dayOfWeek } from '../lib/time.mjs';

const W = 900;
const H = 352;
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// ── data ────────────────────────────────────────────────────────────────────
async function fromGraphQL(login, token) {
  const query = `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
    totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-skate-log' },
    body: JSON.stringify({ query, variables: { login } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GraphQL: ${res.status} ${JSON.stringify(json.errors || json)}`);
  const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
  return json.data.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({ date: d.date, count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0 }));
}

// Without a token (local previews) read the public calendar page instead.
async function fromPage(login) {
  const res = await fetch(`https://github.com/users/${login}/contributions`, { headers: { 'User-Agent': 'profile-skate-log' } });
  if (!res.ok) throw new Error(`contributions page: ${res.status}`);
  const html = await res.text();
  const counts = new Map();
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = m[2].match(/^(\d[\d,]*) contribution/);
    counts.set(m[1], n ? Number(n[1].replace(/,/g, '')) : 0);
  }
  const days = [];
  for (const m of html.matchAll(/<td[^>]*class="ContributionCalendar-day"[^>]*>/g)) {
    const tag = m[0];
    const date = tag.match(/data-date="([^"]+)"/)?.[1];
    const id = tag.match(/id="([^"]+)"/)?.[1];
    const level = Number(tag.match(/data-level="(\d)"/)?.[1] || 0);
    if (date) days.push({ date, count: counts.get(id) ?? (level ? 1 : 0), level });
  }
  if (!days.length) throw new Error('no days found on the contributions page');
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

async function loadDays(login) {
  const token = process.env.GITHUB_TOKEN;
  try {
    return token ? await fromGraphQL(login, token) : await fromPage(login);
  } catch (err) {
    console.warn(`skate log: ${err.message} — drawing an empty year`);
    return null;
  }
}

function streaks(days, today) {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // the current streak survives a quiet "today" (the day isn't over yet)
  let current = 0;
  const upto = days.filter((d) => d.date <= today);
  let i = upto.length - 1;
  if (i >= 0 && upto[i].count === 0) i--;
  for (; i >= 0 && upto[i].count > 0; i--) current++;
  return { longest, current };
}

// ── drawing ─────────────────────────────────────────────────────────────────
export async function skateLog(profile, { today }) {
  let days = await loadDays(profile.login);
  if (!days) {
    const start = addDays(today, -364 - dayOfWeek(addDays(today, -364)));
    days = [];
    for (let d = start; d <= today; d = addDays(d, 1)) days.push({ date: d, count: 0, level: 0 });
  }
  days = days.filter((d) => d.date <= today);
  const total = days.reduce((n, d) => n + d.count, 0);
  const { longest, current } = streaks(days, today);

  const CELL = 11;
  const STEP = 14;
  const X0 = 96;
  const Y0 = 136;
  const first = days[0].date;
  const offset = dayOfWeek(first);
  const weeks = Math.ceil((days.length + offset) / 7);
  const gridW = weeks * STEP - (STEP - CELL);
  const pos = (i) => {
    const k = i + offset;
    return [X0 + Math.floor(k / 7) * STEP, Y0 + (k % 7) * STEP];
  };

  let cells = '';
  let marks = '';
  let months = '';
  let lastMonth = '';
  const bday = profile.birthday.slice(5);
  days.forEach((d, i) => {
    const [x, y] = pos(i);
    cells += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" fill="${LEVELS[d.level]}"/>`;
    const m = d.date.slice(0, 7);
    // label a column when a new month starts in it
    if (((i + offset) % 7 === 0 || i === 0) && m !== lastMonth) {
      const label = MONTHS[Number(d.date.slice(5, 7)) - 1];
      if (i > 0 && x < X0 + gridW - 24) months += text(label, { x, y: Y0 - 10, size: 12, fill: C.inkSoft });
      lastMonth = m;
    }
    if (d.date.slice(5) === bday) marks += `<circle class="smooth" cx="${x + CELL / 2}" cy="${y + CELL / 2}" r="3" fill="${C.orange}" stroke="${C.ink}" stroke-width="1.5"/>`;
    if (d.date === today) marks += `<rect class="smooth" x="${x - 2}" y="${y - 2}" width="${CELL + 4}" height="${CELL + 4}" rx="4" fill="none" stroke="${C.orange}" stroke-width="2.5"><animate attributeName="opacity" values="1;.3;1" dur="1.6s" repeatCount="indefinite"/></rect>`;
  });

  const dayLabels = [['mon', 1], ['wed', 3], ['fri', 5]].map(([l, r]) => text(l, { x: X0 - 14, y: Y0 + r * STEP + 9, size: 11, fill: C.inkSoft, anchor: 'end' })).join('');

  // the cat skates the top lane; a soft highlight follows it down the grid
  const DUR = 24;
  const LANE = 104;
  const S = 2;
  const c = cone();
  const lane = `<rect x="22" y="${LANE}" width="848" height="3" fill="${C.curb}"/>
${[0.18, 0.43, 0.68, 0.9].map((f) => c.svg(X0 + gridW * f, LANE - c.h * S + 1, S)).join('')}`;
  const kitty = `<g>${cat(0).svg(-28, LANE - 25 * S + 1, S)}${cycle('opacity', [1, 0], 0.5)}</g><g opacity="0">${cat(1).svg(-28, LANE - 25 * S + 1, S)}${cycle('opacity', [0, 1], 0.5)}</g>`;
  const ride = `<animateTransform attributeName="transform" type="translate" values="${X0 - 40} 0;${X0 + gridW + 40} 0" dur="${DUR}s" repeatCount="indefinite"/>`;
  const glow = `<clipPath id="grid"><rect x="${X0 - 2}" y="${Y0 - 6}" width="${gridW + 4}" height="${7 * STEP + 8}"/></clipPath><g clip-path="url(#grid)"><g><rect x="-6" y="${Y0 - 4}" width="${CELL + 12}" height="${7 * STEP + 4}" rx="6" fill="${C.sky}" opacity=".22"/>${ride}</g></g>`;

  // legend + numbers
  const LY = Y0 + 7 * STEP + 22;
  const legend = `<rect class="smooth" x="${X0}" y="${LY}" width="12" height="12" rx="3" fill="none" stroke="${C.orange}" stroke-width="2.5"/>${text('today', { x: X0 + 20, y: LY + 11, size: 12, fill: C.inkSoft })}
<circle class="smooth" cx="${X0 + 82}" cy="${LY + 6}" r="4" fill="${C.orange}" stroke="${C.ink}" stroke-width="1.5"/>${text('my birthday', { x: X0 + 92, y: LY + 11, size: 12, fill: C.inkSoft })}
${text('less', { x: X0 + gridW - 40 - 5 * 15 - 6, y: LY + 11, size: 12, fill: C.inkSoft, anchor: 'end' })}
${LEVELS.map((col, i) => `<rect x="${X0 + gridW - 40 - 5 * 15 + 3 + i * 15}" y="${LY}" width="12" height="12" rx="2.5" fill="${col}"/>`).join('')}
${text('more', { x: X0 + gridW, y: LY + 11, size: 12, fill: C.inkSoft, anchor: 'end' })}`;

  const SY = LY + 32;
  const pill = (label, value, x, w) => `<rect class="smooth" x="${x}" y="${SY}" width="${w}" height="34" rx="10" fill="${C.white}" stroke="${C.ink}" stroke-width="2.5"/>
${pixelText(label, { x: x + 14, y: SY + 11, size: 2, fill: C.inkSoft }).svg}
${text(value, { x: x + w - 14, y: SY + 23, size: 15, weight: 700, fill: C.blue, anchor: 'end' })}`;
  const pw = (gridW - 24) / 3;
  const pills = pill('TOTAL', total.toLocaleString('en-US'), X0, pw) + pill('LONGEST', `${longest} day${longest === 1 ? '' : 's'}`, X0 + pw + 12, pw) + pill('CURRENT', `${current} day${current === 1 ? '' : 's'}`, X0 + (pw + 12) * 2, pw);

  const body = `${panel(2, 24, 888, H - 34)}
${tab(24, 4, 'SKATE LOG')}
${text(`@${profile.login} · contributions, last 12 months`, { x: 862, y: 52, size: 13, fill: C.inkSoft, anchor: 'end' })}
${lane}
${glow}
${months}${dayLabels}
${cells}
${marks}
<g>${kitty}${ride}</g>
${legend}
${pills}`;

  return doc(W, H, {
    title: `${profile.name} — skate log`,
    desc: `Skate log — ${total} GitHub contributions in the last year, longest streak ${longest} days, current streak ${current} days. The blue cat skates along the top of the calendar.`,
    body,
  });
}
