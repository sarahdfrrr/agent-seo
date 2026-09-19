import type { DateFilter, DateRangePreset, Granularity } from "@/lib/types";
import { ALL_PRESETS, isValidISODate } from "@/lib/utils/dates";

export type ResolvedFilters = { date: DateFilter; granularity: Granularity };

const GRANULARITIES: Granularity[] = ["day", "week", "month"];

export function parseFilters(searchParams: Record<string, string | string[] | undefined>): ResolvedFilters {
  const granularityRaw = firstValue(searchParams.granularity);
  const granularity = (GRANULARITIES as string[]).includes(granularityRaw ?? "") ? (granularityRaw as Granularity) : "day";

  const start = firstValue(searchParams.start);
  const end = firstValue(searchParams.end);
  if (isValidISODate(start) && isValidISODate(end)) {
    return { date: { mode: "custom", start, end }, granularity };
  }

  const presetRaw = firstValue(searchParams.preset);
  const preset = (ALL_PRESETS as string[]).includes(presetRaw ?? "") ? (presetRaw as DateRangePreset) : "30d";
  return { date: { mode: "preset", preset }, granularity };
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
