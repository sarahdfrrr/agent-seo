import { getOverview } from "@/lib/data/getOverview";
import { parseFilters } from "@/lib/utils/searchParams";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChannelCard } from "@/components/dashboard/ChannelCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { LineTrendChart } from "@/components/charts/LineTrendChart";

export const metadata = { title: "Vue d'ensemble — Pulse" };

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawParams = await searchParams;
  const { preset, granularity } = parseFilters(rawParams);
  const overview = await getOverview(preset, granularity);

  const suffix = `?preset=${preset}&granularity=${granularity}`;

  return (
    <div>
      <PageHeader
        title="Vue d'ensemble"
        description="Tous les canaux d'acquisition et de performance marketing, au même endroit."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {overview.kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} highlight />
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader title={overview.trendTitle} subtitle={`Regroupé par ${granularity === "day" ? "jour" : granularity === "week" ? "semaine" : "mois"}`} />
        <CardBody>
          <LineTrendChart
            data={overview.trend}
            seriesKeys={overview.trendSeriesKeys}
            labels={overview.trendLabels}
            granularity={overview.granularity}
            format="number"
            height={320}
          />
        </CardBody>
      </Card>

      <h2 className="mb-3 mt-6 font-mono text-xs uppercase tracking-wide text-text-muted">Par canal</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {overview.channelCards.map((card) => (
          <ChannelCard key={card.channel} card={card} searchSuffix={suffix} />
        ))}
      </div>
    </div>
  );
}
