// Draws the cards.
//
//   node scripts/build.mjs                      static cards → assets/
//   node scripts/build.mjs daily --out dist     header, status and skate log → dist/ (run by the Action)
//   node scripts/build.mjs preview              everything → preview/ plus preview/index.html
//
// Options:  --today YYYY-MM-DD    pretend it's this date
//           --season hot|rainy|cool   force a season
//           --out DIR
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PROFILE } from './profile.mjs';
import { levelOf, seasonOf, todayIn } from './lib/time.mjs';

const argv = process.argv.slice(2);
const mode = argv[0] && !argv[0].startsWith('--') ? argv.shift() : 'static';
const args = {};
for (let i = 0; i < argv.length; i += 2) {
  if (!argv[i].startsWith('--')) throw new Error(`unexpected argument: ${argv[i]}`);
  args[argv[i].slice(2)] = argv[i + 1];
}

const today = args.today || todayIn();
const ctx = { today, season: args.season || seasonOf(today), level: levelOf(PROFILE.birthday, today) };

const STATIC = async () => {
  const { links } = await import('./cards/links.mjs');
  const { quests } = await import('./cards/quests.mjs');
  const { hobbies, stats } = await import('./cards/sidequests.mjs');
  const { footer } = await import('./cards/footer.mjs');
  return {
    ...Object.fromEntries(PROFILE.links.map((l) => [l.file, links(l)])),
    'quests.svg': quests(PROFILE),
    'hobbies.svg': hobbies(PROFILE),
    'stats.svg': stats(PROFILE),
    'footer.svg': footer(PROFILE),
  };
};

const DAILY = async () => {
  const { header } = await import('./cards/header.mjs');
  const { status } = await import('./cards/status.mjs');
  const { skateLog } = await import('./cards/contributions.mjs');
  return {
    'header.svg': header(PROFILE, ctx),
    'status.svg': status(PROFILE, ctx),
    'skatelog.svg': await skateLog(PROFILE, ctx),
  };
};

const files = mode === 'daily' ? await DAILY() : mode === 'preview' ? { ...(await DAILY()), ...(await STATIC()) } : await STATIC();
const out = args.out || (mode === 'daily' ? 'dist' : mode === 'preview' ? 'preview' : 'assets');
mkdirSync(out, { recursive: true });
for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(out, name), svg);
  console.log(`wrote ${join(out, name)} (${(svg.length / 1024).toFixed(1)} KB)`);
}

if (mode === 'preview') {
  // Same layout as the README, for checking locally in a browser.
  const img = (f, w) => `<img src="${f}" width="${w}">`;
  const links = PROFILE.links.map((l) => img(l.file, '24%')).join(' ');
  const html = `<!doctype html><meta charset="utf-8"><title>profile preview</title>
<style>body{margin:0;padding:24px;background:${args.bg || '#ffffff'}}main{max-width:900px;margin:auto;text-align:center}img{margin:4px 0;vertical-align:top}</style>
<main>${img('header.svg', '100%')}<br>${links}<br>${img('status.svg', '100%')}<br>${img('quests.svg', '100%')}<br>${img('hobbies.svg', '49%')} ${img('stats.svg', '49%')}<br>${img('skatelog.svg', '100%')}<br>${img('footer.svg', '100%')}</main>`;
  writeFileSync(join(out, 'index.html'), html);
  console.log(`wrote ${join(out, 'index.html')} — ${ctx.season} season, lv.${ctx.level.level}`);
}
