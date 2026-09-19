import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { OverviewChannelCard } from "@/lib/data/getOverview";
import { formatDeltaPct, formatMetric } from "@/lib/utils/format";
import { Sparkline } from "@/components/charts/Sparkline";
import { SourceBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

export function ChannelCard({ card, searchSuffix }: { card: OverviewChannelCard; searchSuffix: string }) {
  const kpi = card.primaryKpi;
  const tone =
    kpi.deltaPct === null || Math.abs(kpi.deltaPct) < 0.05
      ? "neutral"
      : (kpi.deltaPct > 0) !== kpi.lowerIsBetter
        ? "good"
        : "bad";

  return (
    <Link
      href={`${card.route}${searchSuffix}`}
      className="group flex flex-col rounded-lg border border-border bg-surface-1 p-4 transition-colors hover:border-border-strong"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: card.color }} />
            <span className="font-mono text-xs text-text-secondary">{card.label}</span>
          </div>
        </div>
        <ArrowRight size={14} className="mt-0.5 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <div className="tabular-nums text-xl font-semibold text-text-primary">
            {formatMetric(kpi.value, kpi.format, { compact: true })}
          </div>
          <div
            className={cn(
              "tabular-nums mt-0.5 font-mono text-[11px]",
              tone === "good" && "text-[color:var(--delta-good)]",
              tone === "bad" && "text-[color:var(--delta-bad)]",
              tone === "neutral" && "text-text-muted",
            )}
          >
            {formatDeltaPct(kpi.deltaPct)}
          </div>
        </div>
        <div className="w-20">
          <Sparkline data={card.sparkline} color={card.color} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
        <span className="line-clamp-1 text-xs text-text-muted">{card.description}</span>
        <SourceBadge source={card.source} />
      </div>
    </Link>
  );
}
