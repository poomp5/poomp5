// Dates as seen from Bangkok, so the level-up and the seasons flip at local midnight.
export const TIMEZONE = process.env.TIMEZONE || 'Asia/Bangkok';

// en-CA formats as YYYY-MM-DD
export function todayIn(timeZone = TIMEZONE) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

const utc = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const DAY = 86400000;

// Thailand's three seasons, by the Thai Meteorological Department's dates.
export function seasonOf(iso) {
  const md = iso.slice(5);
  if (md >= '02-16' && md <= '05-15') return 'hot';
  if (md >= '05-16' && md <= '10-15') return 'rainy';
  return 'cool';
}

// Age as a game level, with XP = how far through the year to the next birthday.
export function levelOf(birthday, today) {
  const [by, bm, bd] = birthday.split('-').map(Number);
  const [ty] = today.split('-').map(Number);
  const pad = (n) => String(n).padStart(2, '0');
  let last = `${ty}-${pad(bm)}-${pad(bd)}`;
  if (last > today) last = `${ty - 1}-${pad(bm)}-${pad(bd)}`;
  const lastYear = Number(last.slice(0, 4));
  const next = `${lastYear + 1}-${pad(bm)}-${pad(bd)}`;
  const total = (utc(next) - utc(last)) / DAY;
  const done = (utc(today) - utc(last)) / DAY;
  return {
    level: lastYear - by,
    xp: done / total,
    daysLeft: total - done,
    isBirthday: done === 0,
  };
}

export function addDays(iso, n) {
  return new Date(utc(iso) + n * DAY).toISOString().slice(0, 10);
}

export function dayOfWeek(iso) {
  return new Date(utc(iso)).getUTCDay();
}
