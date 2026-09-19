import type { DailyRow, Granularity, KpiValue, MetricDefinition, SeriesPoint } from "@/lib/types";
import { bucketKey, filterByRange, groupRows } from "@/lib/utils/dates";
import { computeDeltaPct } from "@/lib/utils/format";

function aggregateMetric(rows: DailyRow[], def: MetricDefinition): number {
  if (rows.length === 0) return 0;
  const nums = (key: string) => rows.map((r) => (typeof r[key] === "number" ? (r[key] as number) : 0));

  switch (def.aggregation) {
    case "sum":
      return nums(def.key).reduce((s, v) => s + v, 0);
    case "avg":
      return nums(def.key).reduce((s, v) => s + v, 0) / rows.length;
    case "avg-weighted": {
      const weightKey = def.weightKey ?? def.key;
      const weights = nums(weightKey);
      const values = nums(def.key);
      const weightSum = weights.reduce((s, v) => s + v, 0);
      if (weightSum === 0) return values.reduce((s, v) => s + v, 0) / rows.length;
      return values.reduce((s, v, i) => s + v * weights[i], 0) / weightSum;
    }
    case "ratio": {
      const numerator = nums(def.numeratorKey ?? def.key).reduce((s, v) => s + v, 0);
      const denominator = nums(def.denominatorKey ?? def.key).reduce((s, v) => s + v, 0);
      return denominator === 0 ? 0 : (numerator / denominator) * (def.format === "percent" ? 100 : 1);
    }
    default:
      return 0;
  }
}

export function computeKpis(
  allRows: DailyRow[],
  defs: MetricDefinition[],
  range: { start: string; end: string },
  previousRange: { start: string; end: string },
): KpiValue[] {
  const currentRows = filterByRange(allRows, range);
  const previousRows = filterByRange(allRows, previousRange);

  return defs.map((def) => {
    const value = aggregateMetric(currentRows, def);
    const previousValue = aggregateMetric(previousRows, def);
    return {
      key: def.key,
      label: def.label,
      format: def.format,
      value,
      previousValue,
      deltaPct: computeDeltaPct(value, previousValue),
      lowerIsBetter: def.lowerIsBetter ?? false,
    };
  });
}

/** Builds a chart-ready trend for the given metric keys, bucketed by granularity.
 * Ratio-style keys (ctr, avgPosition, bounceRate...) are re-derived per bucket
 * from their def rather than naively averaged/summed, when a def is supplied. */
export function buildTrend(
  allRows: DailyRow[],
  range: { start: string; end: string },
  granularity: Granularity,
  seriesKeys: string[],
  defsByKey?: Record<string, MetricDefinition>,
): SeriesPoint[] {
  const rows = filterByRange(allRows, range);
  if (!defsByKey) {
    const grouped = groupRows(rows, granularity);
    return grouped.map((r) => {
      const point: SeriesPoint = { date: r.date };
      for (const key of seriesKeys) point[key] = (r[key] as number) ?? 0;
      return point;
    });
  }

  const buckets = new Map<string, DailyRow[]>();
  for (const row of rows) {
    const key = bucketKey(row.date, granularity);
    const list = buckets.get(key);
    if (list) list.push(row);
    else buckets.set(key, [row]);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bucketRows]) => {
      const point: SeriesPoint = { date };
      for (const key of seriesKeys) {
        const def = defsByKey[key];
        point[key] = def ? aggregateMetric(bucketRows, def) : bucketRows.reduce((s, r) => s + ((r[key] as number) ?? 0), 0);
      }
      return point;
    });
}
