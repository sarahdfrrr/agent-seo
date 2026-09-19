"use client";

import { useMemo, useState } from "react";
import type { Granularity, MetricFormat, SeriesPoint } from "@/lib/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { LineTrendChart } from "@/components/charts/LineTrendChart";
import { seriesColor } from "@/components/charts/palette";
import { cn } from "@/lib/utils/cn";

type Props = {
  title: string;
  subtitle?: string;
  data: SeriesPoint[];
  seriesKeys: string[];
  labels: Record<string, string>;
  granularity: Granularity;
  format?: MetricFormat;
};

export function AcquisitionTrendCard({ title, subtitle, data, seriesKeys, labels, granularity, format = "number" }: Props) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  // Fixed once, from the full key list — so a channel keeps its color
  // whether or not others are currently checked (color follows the entity).
  const colors = useMemo(() => Object.fromEntries(seriesKeys.map((key, i) => [key, seriesColor(i)])), [seriesKeys]);
  const visibleKeys = seriesKeys.filter((k) => !hidden.has(k));

  function toggle(key: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <CardBody>
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
          {seriesKeys.map((key) => {
            const checked = !hidden.has(key);
            return (
              <label
                key={key}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 text-xs transition-opacity",
                  !checked && "opacity-45",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(key)}
                  className="h-3.5 w-3.5 cursor-pointer accent-[var(--accent)]"
                />
                <span className="h-2 w-2 rounded-full" style={{ background: colors[key] }} />
                <span className="text-text-secondary">{labels[key] ?? key}</span>
              </label>
            );
          })}
        </div>

        {visibleKeys.length > 0 ? (
          <LineTrendChart
            data={data}
            seriesKeys={visibleKeys}
            labels={labels}
            granularity={granularity}
            format={format}
            colors={colors}
            legend={false}
            height={320}
          />
        ) : (
          <div className="flex h-[320px] items-center justify-center text-sm text-text-muted">
            Sélectionne au moins un canal pour afficher le graphique.
          </div>
        )}
      </CardBody>
    </Card>
  );
}
