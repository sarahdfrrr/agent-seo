import type { MetricFormat } from "@/lib/types";

const numberFormatter = new Intl.NumberFormat("fr-FR");
const decimalFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const currencyDecimalFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});
const compactFormatter = new Intl.NumberFormat("fr-FR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function formatMetric(value: number, format: MetricFormat, opts?: { compact?: boolean }): string {
  if (!Number.isFinite(value)) return "—";
  switch (format) {
    case "percent":
      return `${decimalFormatter.format(value)} %`;
    case "currency":
      return opts?.compact ? compactCurrency(value) : currencyFormatter.format(value);
    case "decimal":
      return decimalFormatter.format(value);
    case "duration":
      return formatDuration(value);
    case "number":
    default:
      return opts?.compact ? compactFormatter.format(value) : numberFormatter.format(Math.round(value));
  }
}

function compactCurrency(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}${compactFormatter.format(Math.abs(value))} €`;
}

export function formatCurrencyPrecise(value: number): string {
  return currencyDecimalFormatter.format(value);
}

export function formatDeltaPct(deltaPct: number | null): string {
  if (deltaPct === null || !Number.isFinite(deltaPct)) return "—";
  const sign = deltaPct > 0 ? "+" : "";
  return `${sign}${decimalFormatter.format(deltaPct)} %`;
}

export function computeDeltaPct(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}
