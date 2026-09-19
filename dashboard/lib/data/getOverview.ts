import type { ChannelId, Granularity, KpiValue, SeriesPoint } from "@/lib/types";
import type { ResolvedFilters } from "@/lib/utils/searchParams";
import { getChannelData } from "@/lib/data/getChannelData";
import { CHANNEL_BY_ID } from "@/lib/data/channels";

export type OverviewChannelCard = {
  channel: ChannelId;
  label: string;
  description: string;
  color: string;
  route: string;
  source: "mock" | "live";
  primaryKpi: KpiValue;
  sparkline: SeriesPoint[];
};

export type OverviewPayload = {
  range: { start: string; end: string };
  granularity: Granularity;
  kpis: KpiValue[];
  trend: SeriesPoint[];
  trendSeriesKeys: string[];
  trendLabels: Record<string, string>;
  trendTitle: string;
  channelCards: OverviewChannelCard[];
  anyLive: boolean;
};

function pick(kpis: KpiValue[], key: string): KpiValue {
  const found = kpis.find((k) => k.key === key);
  if (!found) throw new Error(`KPI manquant: ${key}`);
  return found;
}

export async function getOverview(filters: ResolvedFilters): Promise<OverviewPayload> {
  const granularity = filters.granularity;
  const [ga4, seo, ads, email, social] = await Promise.all([
    getChannelData("ga4", filters),
    getChannelData("seo", filters),
    getChannelData("ads", filters),
    getChannelData("email", filters),
    getChannelData("social", filters),
  ]);

  const kpis: KpiValue[] = [
    pick(ga4.kpis, "sessions"),
    pick(ga4.kpis, "conversions"),
    pick(ga4.kpis, "conversionRate"),
    pick(ga4.kpis, "revenue"),
    { ...pick(seo.kpis, "clicks"), label: "Clics organiques" },
    { ...pick(ads.kpis, "spend"), label: "Dépense publicitaire" },
    pick(ads.kpis, "roas"),
    { ...pick(social.kpis, "totalFollowers"), label: "Abonnés sociaux" },
  ];

  const payloads = { ga4, seo, ads, email, social };
  const channelCards: OverviewChannelCard[] = (Object.keys(payloads) as ChannelId[]).map((id) => {
    const payload = payloads[id];
    const meta = CHANNEL_BY_ID[id];
    return {
      channel: id,
      label: meta.label,
      description: meta.description,
      color: meta.color,
      route: meta.route,
      source: payload.source,
      primaryKpi: pick(payload.kpis, meta.overviewMetricKey),
      sparkline: payload.trend.map((p) => ({ date: p.date, value: (p[meta.overviewMetricKey] as number) ?? 0 })),
    };
  });

  const mainChart = CHANNEL_BY_ID.ga4.trendCharts[0];

  return {
    range: ga4.range,
    granularity,
    kpis,
    trend: ga4.trend,
    trendSeriesKeys: mainChart.keys,
    trendLabels: mainChart.labels,
    trendTitle: "Sessions par canal d'acquisition (tous canaux)",
    channelCards,
    anyLive: Object.values(payloads).some((p) => p.source === "live"),
  };
}
