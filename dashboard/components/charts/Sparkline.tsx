"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { SeriesPoint } from "@/lib/types";

export function Sparkline({ data, color }: { data: SeriesPoint[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} strokeLinecap="round" isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
