import dataset from "@/data/cigarettes.json";

export type Entry = {
  datetime: string;
  date: string;
  time: string;
  count: number;
  raw: string;
  suspicious: boolean;
};

type Dataset = {
  generated_at: string;
  source: string;
  total_entries: number;
  total_cigs_clean: number;
  suspicious_entries: number;
  entries: Entry[];
};

const data = dataset as Dataset;

export function getCleanEntries(): Entry[] {
  return data.entries.filter((e) => !e.suspicious);
}

export function getMeta() {
  return {
    generated_at: data.generated_at,
    total_entries: data.total_entries,
    total_cigs_clean: data.total_cigs_clean,
    suspicious_entries: data.suspicious_entries,
  };
}

function addDaysUTC(date: string, days: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / 86_400_000);
}

function mondayOf(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  const dow = d.getUTCDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export type DateRange = { first: string; last: string; days: number };

export function dateRange(entries: Entry[]): DateRange {
  if (entries.length === 0) return { first: "", last: "", days: 0 };
  const dates = entries.map((e) => e.date).sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  return { first, last, days: diffDays(first, last) + 1 };
}

export type YearStat = {
  year: string;
  total: number;
  spanDays: number;
  daysWithEntries: number;
  avgPerDay: number;
};

export function byYear(entries: Entry[]): YearStat[] {
  const grouped = new Map<string, Entry[]>();
  for (const e of entries) {
    const y = e.date.slice(0, 4);
    let arr = grouped.get(y);
    if (!arr) {
      arr = [];
      grouped.set(y, arr);
    }
    arr.push(e);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, ys]) => {
      const total = ys.reduce((s, e) => s + e.count, 0);
      const dates = ys.map((e) => e.date).sort();
      const span = diffDays(dates[0], dates[dates.length - 1]) + 1;
      const uniq = new Set(dates).size;
      return {
        year,
        total,
        spanDays: span,
        daysWithEntries: uniq,
        avgPerDay: total / span,
      };
    });
}

export type MonthStat = { month: string; total: number };

export function byMonth(entries: Entry[]): MonthStat[] {
  const sums = new Map<string, number>();
  for (const e of entries) {
    const ym = e.date.slice(0, 7);
    sums.set(ym, (sums.get(ym) ?? 0) + e.count);
  }
  const dates = entries.map((e) => e.date).sort();
  if (dates.length === 0) return [];
  const start = dates[0].slice(0, 7) + "-01";
  const end = dates[dates.length - 1].slice(0, 7) + "-01";
  const result: MonthStat[] = [];
  let cur = start;
  while (cur <= end) {
    const ym = cur.slice(0, 7);
    result.push({ month: ym, total: sums.get(ym) ?? 0 });
    const d = new Date(cur + "T00:00:00Z");
    d.setUTCMonth(d.getUTCMonth() + 1);
    cur = d.toISOString().slice(0, 10);
  }
  return result;
}

export type MonthDetailed = {
  month: string;
  year: string;
  monthIndex: number;
  total: number;
  daysInMonth: number;
  days: number[];
};

export function byMonthDetailed(entries: Entry[]): MonthDetailed[] {
  const months = new Map<string, MonthDetailed>();
  for (const e of entries) {
    const ym = e.date.slice(0, 7);
    const y = e.date.slice(0, 4);
    const mIdx = parseInt(e.date.slice(5, 7), 10) - 1;
    const dIdx = parseInt(e.date.slice(8, 10), 10) - 1;
    let m = months.get(ym);
    if (!m) {
      const daysInMonth = new Date(parseInt(y, 10), mIdx + 1, 0).getDate();
      m = {
        month: ym,
        year: y,
        monthIndex: mIdx,
        total: 0,
        daysInMonth,
        days: new Array<number>(daysInMonth).fill(0),
      };
      months.set(ym, m);
    }
    m.days[dIdx] += e.count;
    m.total += e.count;
  }
  return Array.from(months.values()).sort((a, b) =>
    a.month.localeCompare(b.month),
  );
}

export type WeekStat = { weekStart: string; total: number };

export function byWeek(entries: Entry[]): WeekStat[] {
  const sums = new Map<string, number>();
  for (const e of entries) {
    const wk = mondayOf(e.date);
    sums.set(wk, (sums.get(wk) ?? 0) + e.count);
  }
  const dates = entries.map((e) => e.date).sort();
  if (dates.length === 0) return [];
  const startWk = mondayOf(dates[0]);
  const endWk = mondayOf(dates[dates.length - 1]);
  const result: WeekStat[] = [];
  let cur = startWk;
  while (cur <= endWk) {
    result.push({ weekStart: cur, total: sums.get(cur) ?? 0 });
    cur = addDaysUTC(cur, 7);
  }
  return result;
}

export type DayEvent = { hour: number; minute: number; count: number };
export type DayStat = { date: string; events: DayEvent[]; total: number };

export function byDay(entries: Entry[], lastNDays = 30): DayStat[] {
  const dates = entries.map((e) => e.date).sort();
  if (dates.length === 0) return [];
  const lastDate = dates[dates.length - 1];
  const startDate = addDaysUTC(lastDate, -(lastNDays - 1));

  const map = new Map<string, DayStat>();
  let cur = startDate;
  while (cur <= lastDate) {
    map.set(cur, { date: cur, events: [], total: 0 });
    cur = addDaysUTC(cur, 1);
  }

  for (const e of entries) {
    if (e.date < startDate || e.date > lastDate) continue;
    const r = map.get(e.date);
    if (!r) continue;
    const [h, m] = e.time.split(":").map(Number);
    r.events.push({ hour: h, minute: m, count: e.count });
    r.total += e.count;
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export type HourStat = { hour: number; total: number };

export function byHourOfDay(entries: Entry[]): HourStat[] {
  const buckets = new Array<number>(24).fill(0);
  for (const e of entries) {
    const h = parseInt(e.time.slice(0, 2), 10);
    if (h >= 0 && h < 24) buckets[h] += e.count;
  }
  return buckets.map((total, hour) => ({ hour, total }));
}
