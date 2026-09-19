import type { DateRangePreset, Granularity } from "@/lib/types";
import { ALL_PRESETS } from "@/lib/utils/dates";

export type ResolvedFilters = { preset: DateRangePreset; granularity: Granularity };

const GRANULARITIES: Granularity[] = ["day", "week", "month"];

export function parseFilters(searchParams: Record<string, string | string[] | undefined>): ResolvedFilters {
  const presetRaw = firstValue(searchParams.preset);
  const granularityRaw = firstValue(searchParams.granularity);

  const preset = (ALL_PRESETS as string[]).includes(presetRaw ?? "") ? (presetRaw as DateRangePreset) : "30d";
  const granularity = (GRANULARITIES as string[]).includes(granularityRaw ?? "") ? (granularityRaw as Granularity) : "day";

  return { preset, granularity };
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
