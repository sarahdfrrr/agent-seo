import type { ChannelId, ChannelPayload, DailyRow, TableRow } from "@/lib/types";
import type { ResolvedFilters } from "@/lib/utils/searchParams";
import { dataSourceMode } from "@/lib/env";
import { previousRange, resolveDateFilter, filterByRange, daysBetween } from "@/lib/utils/dates";
import { buildTrend, computeKpis } from "@/lib/data/aggregate";
import { CHANNEL_BY_ID, KPI_DEFS, KPI_DEFS_BY_KEY } from "@/lib/data/channels";
import {
  generateAdCampaigns,
  generateAds,
  generateEmail,
  generateEmailCampaigns,
  generateGA4,
  generateSEO,
  generateSEOPages,
  generateSEOQueries,
  generateSocial,
  generateTopPosts,
} from "@/lib/mock/generator";
import { fetchGA4DailyRows } from "@/lib/integrations/ga4";
import { fetchGSCDailyRows, fetchGSCPages, fetchGSCQueries } from "@/lib/integrations/gsc";
import { fetchGoogleAdsCampaigns, fetchGoogleAdsDailyRows } from "@/lib/integrations/google-ads";
import { fetchMailchimpCampaigns, fetchMailchimpDailyRows } from "@/lib/integrations/mailchimp";

export async function getRows(channel: ChannelId, window: { start: string; end: string }): Promise<{ rows: DailyRow[]; source: "mock" | "live" }> {
  const mode = dataSourceMode(channel);
  if (mode === "live") {
    try {
      const rows = await liveFetch(channel, window);
      return { rows, source: "live" };
    } catch (err) {
      console.error(`[${channel}] live fetch failed, falling back to mock data:`, err instanceof Error ? err.message : err);
    }
  }
  return { rows: mockGenerate(channel, window), source: "mock" };
}

function mockGenerate(channel: ChannelId, window: { start: string; end: string }): DailyRow[] {
  const dates = daysBetween(window.start, window.end);
  switch (channel) {
    case "ga4":
      return generateGA4(dates);
    case "seo":
      return generateSEO(dates);
    case "ads":
      return generateAds(dates);
    case "email":
      return generateEmail(dates);
    case "social":
      return generateSocial(dates);
  }
}

async function liveFetch(channel: ChannelId, window: { start: string; end: string }): Promise<DailyRow[]> {
  switch (channel) {
    case "ga4":
      return fetchGA4DailyRows(window);
    case "seo":
      return fetchGSCDailyRows(window);
    case "ads":
      return fetchGoogleAdsDailyRows(window);
    case "email":
      return fetchMailchimpDailyRows(window);
    case "social":
      // Combining LinkedIn / Instagram / YouTube into one normalized daily
      // series depends on account-specific insight payload shapes — see
      // lib/integrations/social/*.ts. Falls back to mock until wired up.
      throw new Error("Live social connector not wired up yet — see lib/integrations/social/*.ts");
  }
}

function sumRange(rows: DailyRow[], range: { start: string; end: string }, key: string): number {
  return filterByRange(rows, range).reduce((s, r) => s + ((r[key] as number) ?? 0), 0);
}

function lastInRange(rows: DailyRow[], range: { start: string; end: string }, key: string): number {
  const filtered = filterByRange(rows, range);
  return filtered.length ? ((filtered[filtered.length - 1][key] as number) ?? 0) : 0;
}

async function buildBreakdownsAndTables(
  channel: ChannelId,
  rows: DailyRow[],
  range: { start: string; end: string },
  source: "mock" | "live",
): Promise<Pick<ChannelPayload, "breakdown" | "tables">> {
  switch (channel) {
    case "ga4": {
      const sourceRows: TableRow[] = [
        { source: "Organique", sessions: Math.round(sumRange(rows, range, "sessionsOrganic")) },
        { source: "Payant", sessions: Math.round(sumRange(rows, range, "sessionsPaid")) },
        { source: "Direct", sessions: Math.round(sumRange(rows, range, "sessionsDirect")) },
        { source: "Social", sessions: Math.round(sumRange(rows, range, "sessionsSocial")) },
        { source: "Email", sessions: Math.round(sumRange(rows, range, "sessionsEmail")) },
        { source: "Référent", sessions: Math.round(sumRange(rows, range, "sessionsReferral")) },
      ];
      const deviceRows: TableRow[] = [
        { device: "Desktop", sessions: Math.round(sumRange(rows, range, "deviceDesktop")) },
        { device: "Mobile", sessions: Math.round(sumRange(rows, range, "deviceMobile")) },
        { device: "Tablette", sessions: Math.round(sumRange(rows, range, "deviceTablet")) },
      ];
      return {
        breakdown: [
          { title: "Sessions par canal d'acquisition", data: sourceRows, dimensionKey: "source", valueKey: "sessions" },
          { title: "Répartition par appareil", data: deviceRows, dimensionKey: "device", valueKey: "sessions" },
        ],
      };
    }
    case "seo": {
      const queries = source === "live" ? await fetchGSCQueries(range).catch(() => generateSEOQueries()) : generateSEOQueries();
      const pages = source === "live" ? await fetchGSCPages(range).catch(() => generateSEOPages()) : generateSEOPages();
      const buckets = { "Top 3": 0, "4-10": 0, "11-20": 0, "21+": 0 };
      for (const q of queries) {
        if (q.position <= 3) buckets["Top 3"]++;
        else if (q.position <= 10) buckets["4-10"]++;
        else if (q.position <= 20) buckets["11-20"]++;
        else buckets["21+"]++;
      }
      return {
        breakdown: [
          {
            title: "Distribution des positions",
            data: Object.entries(buckets).map(([bucket, count]) => ({ bucket, count })),
            dimensionKey: "bucket",
            valueKey: "count",
          },
        ],
        tables: [
          {
            title: "Meilleures requêtes",
            columns: [
              { key: "query", label: "Requête" },
              { key: "clicks", label: "Clics", format: "number" },
              { key: "impressions", label: "Impressions", format: "number" },
              { key: "ctr", label: "CTR", format: "percent" },
              { key: "position", label: "Position", format: "decimal" },
            ],
            rows: queries as unknown as TableRow[],
          },
          {
            title: "Meilleures pages",
            columns: [
              { key: "page", label: "Page" },
              { key: "sessions", label: "Sessions", format: "number" },
              { key: "conversions", label: "Conversions", format: "number" },
            ],
            rows: pages as unknown as TableRow[],
          },
        ],
      };
    }
    case "ads": {
      const totalSpend = sumRange(rows, range, "spend");
      const totalConversions = sumRange(rows, range, "conversions");
      const campaigns =
        source === "live"
          ? await fetchGoogleAdsCampaigns(range).catch(() => generateAdCampaigns(totalSpend, totalConversions))
          : generateAdCampaigns(totalSpend, totalConversions);
      return {
        tables: [
          {
            title: "Campagnes",
            columns: [
              { key: "campaign", label: "Campagne" },
              { key: "spend", label: "Dépense", format: "currency" },
              { key: "conversions", label: "Conversions", format: "number" },
              { key: "cpa", label: "CPA", format: "currency" },
              { key: "roas", label: "ROAS", format: "decimal" },
            ],
            rows: campaigns as unknown as TableRow[],
          },
        ],
      };
    }
    case "email": {
      const campaigns = source === "live" ? await fetchMailchimpCampaigns().catch(() => generateEmailCampaigns()) : generateEmailCampaigns();
      return {
        tables: [
          {
            title: "Dernières campagnes",
            columns: [
              { key: "subject", label: "Campagne" },
              { key: "recipients", label: "Destinataires", format: "number" },
              { key: "openRate", label: "Taux d'ouverture", format: "percent" },
              { key: "clickRate", label: "Taux de clic", format: "percent" },
            ],
            rows: campaigns as unknown as TableRow[],
          },
        ],
      };
    }
    case "social": {
      const platformRows: TableRow[] = [
        { platform: "LinkedIn", followers: Math.round(lastInRange(rows, range, "linkedinFollowers")) },
        { platform: "Instagram", followers: Math.round(lastInRange(rows, range, "instagramFollowers")) },
        { platform: "YouTube", followers: Math.round(lastInRange(rows, range, "youtubeFollowers")) },
      ];
      return {
        breakdown: [{ title: "Abonnés par plateforme", data: platformRows, dimensionKey: "platform", valueKey: "followers" }],
        tables: [
          {
            title: "Meilleurs posts",
            columns: [
              { key: "platform", label: "Plateforme" },
              { key: "title", label: "Post" },
              { key: "impressions", label: "Impressions", format: "number" },
              { key: "engagementRate", label: "Engagement", format: "percent" },
            ],
            rows: generateTopPosts() as unknown as TableRow[],
          },
        ],
      };
    }
  }
}

export async function getChannelData(channel: ChannelId, filters: ResolvedFilters): Promise<ChannelPayload> {
  const today = new Date();
  const range = resolveDateFilter(filters.date, today);
  const prevRange = previousRange(range);
  const window = { start: prevRange.start, end: range.end };
  const granularity = filters.granularity;

  const { rows, source } = await getRows(channel, window);
  const meta = CHANNEL_BY_ID[channel];
  const kpis = computeKpis(rows, KPI_DEFS[channel], range, prevRange);
  // A channel page may render several small-multiple charts (see
  // trendCharts) plus the overview page's own sparkline — fetch the union
  // of every key any of them needs in one pass.
  const chartKeys = meta.trendCharts.flatMap((c) => c.keys);
  const trendFetchKeys = Array.from(new Set([...chartKeys, meta.overviewMetricKey]));
  const trend = buildTrend(rows, range, granularity, trendFetchKeys, KPI_DEFS_BY_KEY[channel]);
  const { breakdown, tables } = await buildBreakdownsAndTables(channel, rows, range, source);

  return {
    channel,
    source,
    granularity,
    range,
    kpis,
    trend,
    trendSeriesKeys: chartKeys,
    breakdown,
    tables,
  };
}
