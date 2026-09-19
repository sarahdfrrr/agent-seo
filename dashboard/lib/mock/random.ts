/**
 * Deterministic pseudo-random helpers so the demo dataset is stable across
 * requests/renders (same date + metric always yields the same value) while
 * still looking organic (trend + weekly seasonality + bounded noise).
 */

function hashString(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — fast, tiny, decent statistical quality for demo data. */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A [0,1) value deterministic for the given key (e.g. "ga4:sessions:2026-03-04"). */
export function seededUnit(key: string): number {
  return mulberry32(hashString(key))();
}

/** Deterministic standard-normal-ish noise in [-1, 1] via two blended uniforms. */
export function seededNoise(key: string): number {
  const a = seededUnit(`${key}:a`);
  const b = seededUnit(`${key}:b`);
  return (a + b - 1) * (a >= b ? 1 : -1) * 0.5 + (a - 0.5);
}

const DAY_MS = 86_400_000;
const EPOCH = Date.UTC(2020, 0, 1);

export function daysSinceEpoch(dateISO: string): number {
  return Math.floor((Date.parse(dateISO + "T00:00:00Z") - EPOCH) / DAY_MS);
}

export function dayOfWeek(dateISO: string): number {
  return new Date(dateISO + "T00:00:00Z").getUTCDay(); // 0 = Sunday
}

/** Weekday/weekend seasonality multiplier. `weekendDip` in [0,1]: how much
 * weekends drop relative to weekdays (0 = no seasonality). */
export function weeklySeasonality(dateISO: string, weekendDip: number): number {
  const dow = dayOfWeek(dateISO);
  const isWeekend = dow === 0 || dow === 6;
  return isWeekend ? 1 - weekendDip : 1;
}

/** Smooth long-run growth curve from `startMultiplier` to `endMultiplier`
 * across `totalDays`, using ordinal position `t` in [0, totalDays]. */
export function growthCurve(t: number, totalDays: number, startMultiplier: number, endMultiplier: number): number {
  const progress = totalDays <= 0 ? 1 : Math.min(1, Math.max(0, t / totalDays));
  // Ease-in-out so growth isn't perfectly linear.
  const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  return startMultiplier + (endMultiplier - startMultiplier) * eased;
}

/**
 * Core value generator: base level, long-run growth, weekly seasonality,
 * bounded noise, and occasional spikes (campaigns, viral posts...).
 */
export function seriesValue(opts: {
  seedKey: string;
  date: string;
  ordinal: number;
  totalDays: number;
  base: number;
  growthStart?: number;
  growthEnd?: number;
  weekendDip?: number;
  noisePct?: number;
  spikeChance?: number;
  spikeMultiplier?: number;
  min?: number;
}): number {
  const {
    seedKey,
    date,
    ordinal,
    totalDays,
    base,
    growthStart = 0.85,
    growthEnd = 1.25,
    weekendDip = 0,
    noisePct = 0.08,
    spikeChance = 0,
    spikeMultiplier = 1.6,
    min = 0,
  } = opts;

  let value = base;
  value *= growthCurve(ordinal, totalDays, growthStart, growthEnd);
  value *= weeklySeasonality(date, weekendDip);
  value *= 1 + seededNoise(`${seedKey}:${date}`) * noisePct;

  if (spikeChance > 0 && seededUnit(`${seedKey}:spike:${date}`) < spikeChance) {
    value *= spikeMultiplier;
  }

  return Math.max(min, value);
}
