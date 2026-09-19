import type { MetricDefinition, TableRow } from "@/lib/types";
import type { ResolvedFilters } from "@/lib/utils/searchParams";
import { filterByRange, previousRange, resolveDateFilter } from "@/lib/utils/dates";
import { buildTrend, computeKpis } from "@/lib/data/aggregate";
import { CHANNEL_BY_ID, KPI_DEFS, KPI_DEFS_BY_KEY } from "@/lib/data/channels";
import { getRows } from "@/lib/data/getChannelData";
import { generateTopPosts } from "@/lib/mock/generator";
import { SOCIAL_PLATFORMS, type SocialPayload, type SocialPlatformData, type SocialPlatformId } from "@/lib/data/socialPlatforms";

function platformKpiDefs(id: SocialPlatformId): MetricDefinition[] {
  const defs: MetricDefinition[] = [
    { key: `${id}Followers`, label: "Abonnés", format: "number", aggregation: "avg" },
    { key: `${id}FollowerGain`, label: "Nouveaux abonnés", format: "number", aggregation: "sum" },
    { key: `${id}Impressions`, label: "Impressions", format: "number", aggregation: "sum" },
    { key: `${id}Engagements`, label: "Engagements", format: "number", aggregation: "sum" },
    {
      key: `${id}EngagementRate`,
      label: "Taux d'engagement",
      format: "percent",
      aggregation: "ratio",
      numeratorKey: `${id}Engagements`,
      denominatorKey: `${id}Impressions`,
    },
  ];
  if (id === "youtube") {
    defs.push({ key: "youtubeViews", label: "Vues vidéo", format: "number", aggregation: "sum" });
  }
  return defs;
}


function lastInRange(rows: { date: string; [k: string]: number | string }[], range: { start: string; end: string }, key: string): number {
  const filtered = filterByRange(rows, range);
  return filtered.length ? ((filtered[filtered.length - 1][key] as number) ?? 0) : 0;
}

export async function getSocialData(filters: ResolvedFilters): Promise<SocialPayload> {
  const today = new Date();
  const range = resolveDateFilter(filters.date, today);
  const prevRange = previousRange(range);
  const window = { start: prevRange.start, end: range.end };
  const granularity = filters.granularity;

  const { rows, source } = await getRows("social", window);
  const meta = CHANNEL_BY_ID.social;

  const kpis = computeKpis(rows, KPI_DEFS.social, range, prevRange);
  const allPosts = generateTopPosts();

  const combinedChartKeys = meta.trendCharts.flatMap((c) => c.keys);
  const platformFollowerKeys = SOCIAL_PLATFORMS.map((p) => `${p.id}Followers`);
  const trendFetchKeys = Array.from(new Set([...combinedChartKeys, meta.overviewMetricKey, ...platformFollowerKeys]));
  const trend = buildTrend(rows, range, granularity, trendFetchKeys, KPI_DEFS_BY_KEY.social);

  const platforms: SocialPlatformData[] = SOCIAL_PLATFORMS.map((p) => {
    const defs = platformKpiDefs(p.id);
    const defsByKey = Object.fromEntries(defs.map((d) => [d.key, d]));
    return {
      id: p.id,
      label: p.label,
      color: p.color,
      kpis: computeKpis(rows, defs, range, prevRange),
      trend: buildTrend(rows, range, granularity, [`${p.id}Impressions`, `${p.id}Followers`], defsByKey),
      posts: allPosts.filter((post) => post.platform.toLowerCase() === p.id) as unknown as TableRow[],
    };
  });

  const platformFollowerRows: TableRow[] = SOCIAL_PLATFORMS.map((p) => ({
    platform: p.label,
    followers: Math.round(lastInRange(rows, range, `${p.id}Followers`)),
  }));

  return {
    channel: "social",
    source,
    granularity,
    range,
    kpis,
    trend,
    trendSeriesKeys: combinedChartKeys,
    breakdown: [{ title: "Abonnés par plateforme", data: platformFollowerRows, dimensionKey: "platform", valueKey: "followers" }],
    tables: [
      {
        title: "Meilleurs posts",
        columns: [
          { key: "platform", label: "Plateforme" },
          { key: "title", label: "Post" },
          { key: "impressions", label: "Impressions", format: "number" },
          { key: "engagementRate", label: "Engagement", format: "percent" },
        ],
        rows: allPosts as unknown as TableRow[],
      },
    ],
    platforms,
  };
}
