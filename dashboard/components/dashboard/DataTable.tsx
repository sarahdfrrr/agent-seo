import type { MetricFormat, TableRow } from "@/lib/types";
import { formatMetric } from "@/lib/utils/format";

type Column = { key: string; label: string; format?: MetricFormat };

export function DataTable({ columns, rows }: { columns: Column[]; rows: TableRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col, i) => (
              <th
                key={col.key}
                className={
                  "px-3 py-2 text-left font-mono text-[11px] font-normal uppercase tracking-wide text-text-muted " +
                  (i > 0 ? "text-right" : "")
                }
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border/60 last:border-0 hover:bg-surface-2/60">
              {columns.map((col, ci) => {
                const raw = row[col.key];
                const value = col.format && typeof raw === "number" ? formatMetric(raw, col.format) : raw;
                return (
                  <td
                    key={col.key}
                    className={"px-3 py-2 text-text-secondary " + (ci > 0 ? "tabular-nums text-right text-text-primary" : "text-text-primary")}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
