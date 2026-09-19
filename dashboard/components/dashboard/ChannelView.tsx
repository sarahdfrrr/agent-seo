import type { ChannelPayload } from "@/lib/types";
import type { ChannelMeta } from "@/lib/data/channels";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { LineTrendChart } from "@/components/charts/LineTrendChart";
import { BarBreakdownChart } from "@/components/charts/BarBreakdownChart";
import { DataTable } from "@/components/dashboard/DataTable";

export function ChannelView({
  meta,
  payload,
  hideHeader,
}: {
  meta: ChannelMeta;
  payload: ChannelPayload;
  /** Skip the page header — used when a parent (e.g. SocialView's tabs) already renders one. */
  hideHeader?: boolean;
}) {
  return (
    <div>
      {hideHeader ? null : <PageHeader title={meta.label} description={meta.description} source={payload.source} />}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {payload.kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      <div className={`mt-4 grid gap-4 ${payload.channel === "seo" || payload.channel === "ads" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
        {meta.trendCharts.map((chart) => (
          <Card key={chart.title}>
            <CardHeader title={chart.title} />
            <CardBody>
              <LineTrendChart
                data={payload.trend}
                seriesKeys={chart.keys}
                labels={chart.labels}
                granularity={payload.granularity}
                format={chart.format}
              />
            </CardBody>
          </Card>
        ))}
      </div>

      {payload.breakdown?.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {payload.breakdown.map((b) => (
            <Card key={b.title}>
              <CardHeader title={b.title} />
              <CardBody>
                <BarBreakdownChart data={b.data} dimensionKey={b.dimensionKey} valueKey={b.valueKey} />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : null}

      {payload.tables?.length ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {payload.tables.map((t) => (
            <Card key={t.title}>
              <CardHeader title={t.title} />
              <DataTable columns={t.columns} rows={t.rows} />
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
