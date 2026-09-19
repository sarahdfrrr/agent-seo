import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  subDays,
} from "date-fns";
import type { DateFilter, DateRangePreset, DailyRow, Granularity } from "@/lib/types";

export const ISO = "yyyy-MM-dd";

export function toISO(d: Date): string {
  return format(d, ISO);
}

export function fromISO(s: string): Date {
  return parseISO(s);
}

/** Resolve a preset (or explicit range) against a fixed "today" anchor so the
 * demo data stays stable across renders. */
export function resolveRange(
  preset: DateRangePreset,
  today: Date,
): { start: string; end: string } {
  const end = today;
  switch (preset) {
    case "7d":
      return { start: toISO(subDays(end, 6)), end: toISO(end) };
    case "30d":
      return { start: toISO(subDays(end, 29)), end: toISO(end) };
    case "90d":
      return { start: toISO(subDays(end, 89)), end: toISO(end) };
    case "mtd":
      return { start: toISO(startOfMonth(end)), end: toISO(end) };
    case "qtd":
      return { start: toISO(startOfQuarter(end)), end: toISO(end) };
    case "12m":
      return { start: toISO(subDays(end, 364)), end: toISO(end) };
    default:
      return { start: toISO(subDays(end, 29)), end: toISO(end) };
  }
}

export function isValidISODate(s: string | undefined | null): s is string {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
}

/** Resolve either a preset or an explicit custom range into concrete
 * start/end dates. A custom range is clamped so it never reaches past
 * "today" and never has end < start. */
export function resolveDateFilter(filter: DateFilter, today: Date): { start: string; end: string } {
  if (filter.mode === "preset") return resolveRange(filter.preset, today);
  const todayISO = toISO(today);
  const start = filter.start > todayISO ? todayISO : filter.start;
  const end = filter.end > todayISO ? todayISO : filter.end;
  return start <= end ? { start, end } : { start: end, end: start };
}

/** The immediately preceding period of equal length, for delta comparisons. */
export function previousRange(range: { start: string; end: string }) {
  const start = fromISO(range.start);
  const end = fromISO(range.end);
  const lengthDays = differenceInCalendarDays(end, start) + 1;
  const prevEnd = subDays(start, 1);
  const prevStart = subDays(prevEnd, lengthDays - 1);
  return { start: toISO(prevStart), end: toISO(prevEnd) };
}

export function filterByRange<T extends { date: string }>(
  rows: T[],
  range: { start: string; end: string },
): T[] {
  return rows.filter((r) => r.date >= range.start && r.date <= range.end);
}

const PRESET_LABELS: Record<DateRangePreset, string> = {
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  "90d": "90 derniers jours",
  mtd: "Depuis le début du mois",
  qtd: "Depuis le début du trimestre",
  "12m": "12 derniers mois",
};

export function presetLabel(preset: DateRangePreset): string {
  return PRESET_LABELS[preset];
}

export const ALL_PRESETS: DateRangePreset[] = ["7d", "30d", "90d", "mtd", "qtd", "12m"];

/** Bucket key for grouping a date under a granularity. */
export function bucketKey(dateISO: string, granularity: Granularity): string {
  const d = fromISO(dateISO);
  if (granularity === "day") return dateISO;
  if (granularity === "week") return toISO(startOfWeek(d, { weekStartsOn: 1 }));
  return format(d, "yyyy-MM-01");
}

export function bucketLabel(key: string, granularity: Granularity): string {
  const d = fromISO(key);
  if (granularity === "day") return format(d, "d MMM");
  if (granularity === "week") return `Sem. du ${format(d, "d MMM")}`;
  return format(d, "MMM yyyy");
}

/** Group daily rows into day/week/month buckets, summing numeric metrics. */
export function groupRows(rows: DailyRow[], granularity: Granularity): DailyRow[] {
  if (granularity === "day") return rows;
  const buckets = new Map<string, DailyRow>();
  for (const row of rows) {
    const key = bucketKey(row.date, granularity);
    const existing = buckets.get(key);
    if (!existing) {
      buckets.set(key, { ...row, date: key });
      continue;
    }
    for (const k of Object.keys(row)) {
      if (k === "date") continue;
      const val = row[k];
      if (typeof val === "number") {
        existing[k] = ((existing[k] as number) ?? 0) + val;
      }
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function daysBetween(start: string, end: string): string[] {
  return eachDayOfInterval({ start: fromISO(start), end: fromISO(end) }).map(toISO);
}

export function endOfMonthISO(d: Date): string {
  return toISO(endOfMonth(d));
}

export function endOfWeekISO(d: Date): string {
  return toISO(endOfWeek(d, { weekStartsOn: 1 }));
}

export function addDaysISO(dateISO: string, amount: number): string {
  return toISO(addDays(fromISO(dateISO), amount));
}
