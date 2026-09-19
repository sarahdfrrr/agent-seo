"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MetricFormat, TableRow } from "@/lib/types";
import { formatMetric } from "@/lib/utils/format";
import { seriesColor } from "@/components/charts/palette";

type Props = {
  data: TableRow[];
  dimensionKey: string;
  valueKey: string;
  format?: MetricFormat;
  height?: number;
};

function CustomTooltip({
  active,
  payload,
  dimensionKey,
  format,
}: {
  active?: boolean;
  payload?: { payload: TableRow; value: number }[];
  dimensionKey: string;
  format: MetricFormat;
}) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-surface-1 px-3 py-2 shadow-lg">
      <div className="text-xs font-medium text-text-primary">{row[dimensionKey]}</div>
      <div className="tabular-nums mt-0.5 text-xs text-text-secondary">{formatMetric(payload[0].value, format)}</div>
    </div>
  );
}

export function BarBreakdownChart({ data, dimensionKey, valueKey, format = "number", height = 220 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }} barCategoryGap={10}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey={dimensionKey}
          tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={96}
        />
        <Tooltip content={<CustomTooltip dimensionKey={dimensionKey} format={format} />} cursor={{ fill: "var(--surface-2)" }} />
        <Bar dataKey={valueKey} radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={seriesColor(i)} />
          ))}
          <LabelList
            dataKey={valueKey}
            position="right"
            fill="var(--text-secondary)"
            fontSize={11}
            formatter={(v) => formatMetric(Number(v), format, { compact: true })}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
