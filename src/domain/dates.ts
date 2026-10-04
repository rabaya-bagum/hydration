/** Day keys are YYYY-MM-DD in a given IANA zone. Never derive days from UTC. */
export type DayKey = string;

const formatters = new Map<string, Intl.DateTimeFormat>();
function fmt(tz: string) {
  let f = formatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    });
    formatters.set(tz, f);
  }
  return f;
}

function parts(iso: string | Date, tz: string) {
  const out: Record<string, string> = {};
  for (const p of fmt(tz).formatToParts(typeof iso === 'string' ? new Date(iso) : iso)) out[p.type] = p.value;
  return out;
}

export const deviceTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export function dayKey(instant: string | Date, tz: string): DayKey {
  const p = parts(instant, tz);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Minutes since local midnight in `tz` (0..1439). */
export function minutesOfDay(instant: string | Date, tz: string): number {
  const p = parts(instant, tz);
  return Number(p.hour) * 60 + Number(p.minute);
}

/** Calendar arithmetic on day keys (DST-safe: uses UTC noon as an anchor). */
export function addDays(key: DayKey, n: number): DayKey {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d + n, 12));
  return date.toISOString().slice(0, 10);
}

export function daysBetween(a: DayKey, b: DayKey): number {
  const t = (k: DayKey) => {
    const [y, m, d] = k.split('-').map(Number) as [number, number, number];
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((t(b) - t(a)) / 86_400_000);
}

export function lastNDays(today: DayKey, n: number): DayKey[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
}

/** 0 = Monday ... 6 = Sunday. */
export function weekdayIndex(key: DayKey): number {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return (new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay() + 6) % 7;
}

export const startOfWeek = (key: DayKey): DayKey => addDays(key, -weekdayIndex(key));

export function monthGrid(year: number, month1: number): (DayKey | null)[] {
  const first = `${year}-${String(month1).padStart(2, '0')}-01`;
  const count = new Date(Date.UTC(year, month1, 0)).getUTCDate();
  const cells: (DayKey | null)[] = Array(weekdayIndex(first)).fill(null);
  for (let d = 1; d <= count; d++) cells.push(`${year}-${String(month1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function formatClock(instant: string, tz: string, hour12 = false): string {
  const p = parts(instant, tz);
  if (!hour12) return `${p.hour}:${p.minute}`;
  const h = Number(p.hour);
  return `${h % 12 || 12}:${p.minute} ${h < 12 ? 'AM' : 'PM'}`;
}

export function greetingFor(hour: number): string {
  if (hour < 5) return 'Hello, night owl';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Device-local Date for a day key + minutes-of-day (DST-safe: Date normalises nonexistent times). */
export function localDate(day: DayKey, minutes: number): Date {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d, Math.floor(minutes / 60), minutes % 60, 0, 0);
}
