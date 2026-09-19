"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Granularity, MetricFormat, SeriesPoint } from "@/lib/types";
import { bucketLabel } from "@/lib/utils/dates";
import { formatMetric } from "@/lib/utils/format";
import { seriesColor } from "@/components/charts/palette";

type Props = {
  data: SeriesPoint[];
  seriesKeys: string[];
  labels: Record<string, string>;
  granularity: Granularity;
  format?: MetricFormat;
  height?: number;
};

function CustomTooltip({
  active,
  payload,
  label,
  granularity,
  labels,
  format,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color?: string }[];
  label?: string;
  granularity: Granularity;
  labels: Record<string, string>;
  format: MetricFormat;
}) {
  if (!active || !payload || !payload.length || !label) return null;

  return (
    <div className="rounded-md border border-border bg-surface-1 px-3 py-2 shadow-lg">
      <div className="mb-1.5 font-mono text-[11px] text-text-muted">{bucketLabel(label, granularity)}</div>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
            <span className="text-text-secondary">{labels[p.dataKey] ?? p.dataKey}</span>
            <span className="tabular-nums ml-auto font-medium text-text-primary">{formatMetric(p.value, format)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineTrendChart({ data, seriesKeys, labels, granularity, format = "number", height = 280 }: Props) {
  const showLegend = seriesKeys.length > 1;

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => bucketLabel(v, granularity)}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={{ stroke: "var(--baseline)" }}
            tickLine={false}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={(v: number) => formatMetric(v, format, { compact: true })}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            content={<CustomTooltip granularity={granularity} labels={labels} format={format} />}
            cursor={{ stroke: "var(--baseline)", strokeWidth: 1 }}
          />
          {seriesKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={seriesColor(i)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              strokeLinecap="round"
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {showLegend ? (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3">
          {seriesKeys.map((key, i) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: seriesColor(i) }} />
              <span className="text-xs text-text-secondary">{labels[key] ?? key}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
