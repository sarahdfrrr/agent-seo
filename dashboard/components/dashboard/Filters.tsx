"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Granularity } from "@/lib/types";
import { ALL_PRESETS, presetLabel, resolveRange, toISO } from "@/lib/utils/dates";
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
  const { date, granularity } = parseFilters(Object.fromEntries(searchParams.entries()));
  const isCustom = date.mode === "custom";
  const todayISO = toISO(new Date());

  // Local, always-fresh source of truth for the two date inputs while
  // editing. Reading the "other" field from the URL-derived `date` between
  // two quick edits is a race — the URL push from the first edit hasn't
  // round-tripped yet, so the second edit would silently overwrite it with
  // a stale value. Both fields update from this single object instead.
  const [range, setRange] = useState<{ start: string; end: string }>(() =>
    isCustom ? { start: date.start, end: date.end } : resolveRange("30d", new Date()),
  );
  // Tracks the last URL-derived custom range we've adopted, so we can tell
  // "the URL changed externally (back/forward, shared link)" apart from
  // "we just pushed this exact value ourselves". Adjusting state during
  // render (rather than in an effect) is the React-recommended way to
  // reset state when a prop/derived value changes — see "You Might Not
  // Need An Effect".
  const [syncedFrom, setSyncedFrom] = useState<{ start: string; end: string } | null>(
    isCustom ? { start: date.start, end: date.end } : null,
  );
  if (isCustom && (date.start !== syncedFrom?.start || date.end !== syncedFrom?.end)) {
    setSyncedFrom({ start: date.start, end: date.end });
    setRange({ start: date.start, end: date.end });
  }

  function navigate(params: URLSearchParams) {
    router.push(`${pathname}?${params.toString()}`);
  }

  function handlePresetOrCustomChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "custom") {
      const fallback = isCustom ? range : resolveRange(date.mode === "preset" ? date.preset : "30d", new Date());
      setRange(fallback);
      params.set("start", fallback.start);
      params.set("end", fallback.end);
      params.delete("preset");
    } else {
      params.set("preset", value);
      params.delete("start");
      params.delete("end");
    }
    navigate(params);
  }

  function handleDateChange(which: "start" | "end", value: string) {
    if (!value) return;
    const next = { ...range, [which]: value };
    setRange(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("start", next.start);
    params.set("end", next.end);
    params.delete("preset");
    navigate(params);
  }

  function handleGranularityChange(value: Granularity) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("granularity", value);
    navigate(params);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={isCustom ? "custom" : date.preset}
        onChange={(e) => handlePresetOrCustomChange(e.target.value)}
        className="rounded-md border border-border bg-surface-2 px-2.5 py-1.5 font-mono text-xs text-text-primary outline-none transition-colors focus:border-accent"
      >
        {ALL_PRESETS.map((p) => (
          <option key={p} value={p}>
            {presetLabel(p)}
          </option>
        ))}
        <option value="custom">Période personnalisée</option>
      </select>

      {isCustom ? (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={range.start}
            max={range.end}
            onChange={(e) => handleDateChange("start", e.target.value)}
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 font-mono text-xs text-text-primary outline-none transition-colors focus:border-accent"
          />
          <span className="text-xs text-text-muted">→</span>
          <input
            type="date"
            value={range.end}
            min={range.start}
            max={todayISO}
            onChange={(e) => handleDateChange("end", e.target.value)}
            className="rounded-md border border-border bg-surface-2 px-2 py-1.5 font-mono text-xs text-text-primary outline-none transition-colors focus:border-accent"
          />
        </div>
      ) : null}

      <div className="flex rounded-md border border-border bg-surface-2 p-0.5">
        {GRANULARITIES.map((g) => (
          <button
            key={g.value}
            type="button"
            onClick={() => handleGranularityChange(g.value)}
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
