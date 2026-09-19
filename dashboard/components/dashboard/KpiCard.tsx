import type { KpiValue } from "@/lib/types";
import { formatDeltaPct, formatMetric } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function deltaTone(kpi: KpiValue): "good" | "bad" | "neutral" {
  if (kpi.deltaPct === null || Math.abs(kpi.deltaPct) < 0.05) return "neutral";
  const isIncrease = kpi.deltaPct > 0;
  const isGood = kpi.lowerIsBetter ? !isIncrease : isIncrease;
  return isGood ? "good" : "bad";
}

export function KpiCard({ kpi, highlight }: { kpi: KpiValue; highlight?: boolean }) {
  const tone = deltaTone(kpi);

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface-1 p-4",
        highlight && "border-accent/30 bg-accent-soft/40",
      )}
    >
      <div className="font-mono text-[11px] uppercase tracking-wide text-text-muted">{kpi.label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="tabular-nums text-2xl font-semibold text-text-primary">
          {formatMetric(kpi.value, kpi.format)}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span
          className={cn(
            "tabular-nums font-mono text-xs",
            tone === "good" && "text-[color:var(--delta-good)]",
            tone === "bad" && "text-[color:var(--delta-bad)]",
            tone === "neutral" && "text-text-muted",
          )}
        >
          {tone === "good" ? "▲" : tone === "bad" ? "▼" : "•"} {formatDeltaPct(kpi.deltaPct)}
        </span>
        <span className="text-xs text-text-muted">vs période préc.</span>
      </div>
    </div>
  );
}
