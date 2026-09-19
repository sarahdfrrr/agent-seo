"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DateRangePreset, Granularity } from "@/lib/types";
import { ALL_PRESETS, presetLabel } from "@/lib/utils/dates";
import { parseFilters } from "@/lib/utils/searchParams";
import { cn } from "@/lib/utils/cn";

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: "day", label: "Jour" },
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
];

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { preset, granularity } = parseFilters(Object.fromEntries(searchParams.entries()));

  function update(next: Partial<{ preset: DateRangePreset; granularity: Granularity }>) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.preset) params.set("preset", next.preset);
    if (next.granularity) params.set("granularity", next.granularity);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={preset}
        onChange={(e) => update({ preset: e.target.value as DateRangePreset })}
        className="rounded-md border border-border bg-surface-2 px-2.5 py-1.5 font-mono text-xs text-text-primary outline-none transition-colors focus:border-accent"
      >
        {ALL_PRESETS.map((p) => (
          <option key={p} value={p}>
            {presetLabel(p)}
          </option>
        ))}
      </select>

      <div className="flex rounded-md border border-border bg-surface-2 p-0.5">
        {GRANULARITIES.map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => update({ granularity: g.value })}
            className={cn(
              "rounded px-2.5 py-1 font-mono text-xs transition-colors",
              granularity === g.value ? "bg-accent text-accent-ink" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );
}
