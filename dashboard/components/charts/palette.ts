/** Fixed categorical order — never cycled arbitrarily, see dataviz skill. */
export const SERIES_TOKENS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
];

export function seriesColor(index: number): string {
  return SERIES_TOKENS[index % SERIES_TOKENS.length];
}
