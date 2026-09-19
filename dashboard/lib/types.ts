export type ChannelId = "ga4" | "seo" | "ads" | "email" | "social";

export type Granularity = "day" | "week" | "month";

/** One day of raw metrics for a channel. Values are numeric except where noted. */
export type DailyRow = {
  date: string; // ISO yyyy-mm-dd
  [metric: string]: number | string;
};

export type MetricFormat = "number" | "percent" | "currency" | "duration" | "decimal";

export type MetricDefinition = {
  key: string;
  label: string;
  format: MetricFormat;
  /**
   * How daily values combine into a period:
   * - sum: counts (sessions, clicks, spend...)
   * - avg: simple mean of daily values
   * - avg-weighted: mean weighted by `weightKey` (e.g. avg position weighted by impressions)
   * - ratio: sum(numeratorKey) / sum(denominatorKey) — correct for rates like CTR
   */
  aggregation: "sum" | "avg" | "avg-weighted" | "ratio";
  weightKey?: string;
  numeratorKey?: string;
  denominatorKey?: string;
  /** Lower is better (e.g. bounce rate, CPA, avg position). Defaults to false. */
  lowerIsBetter?: boolean;
  /** Series color token, e.g. "var(--series-2)". */
  color?: string;
  helpText?: string;
};

export type KpiValue = {
  key: string;
  label: string;
  format: MetricFormat;
  value: number;
  previousValue: number;
  deltaPct: number | null;
  lowerIsBetter: boolean;
};

export type SeriesPoint = {
  date: string;
  [seriesKey: string]: number | string;
};

export type TableRow = Record<string, string | number>;

export type ChannelPayload = {
  channel: ChannelId;
  source: "mock" | "live";
  granularity: Granularity;
  range: { start: string; end: string };
  kpis: KpiValue[];
  trend: SeriesPoint[];
  trendSeriesKeys: string[];
  breakdown?: { title: string; data: TableRow[]; dimensionKey: string; valueKey: string }[];
  tables?: { title: string; columns: { key: string; label: string; format?: MetricFormat }[]; rows: TableRow[] }[];
};

export type DateRangePreset = "7d" | "30d" | "90d" | "mtd" | "qtd" | "12m";
