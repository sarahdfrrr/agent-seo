import { google } from "googleapis";
import type { DailyRow } from "@/lib/types";
import { requireEnv } from "@/lib/env";
import { getGoogleAuth } from "@/lib/integrations/google-auth";

/**
 * Live GA4 connector using the Analytics Data API (GA4). Activate by setting
 * DATA_SOURCE_GA4=live plus GA4_PROPERTY_ID and the Google service-account
 * env vars (see .env.example and google-auth.ts).
 */
export async function fetchGA4DailyRows(range: { start: string; end: string }): Promise<DailyRow[]> {
  const propertyId = requireEnv("GA4_PROPERTY_ID");
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/analytics.readonly"]);
  const analyticsData = google.analyticsdata({ version: "v1beta", auth });

  const [totals, channelSplit, deviceSplit] = await Promise.all([
    analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: range.start, endDate: range.end }],
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "newUsers" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
          { name: "engagementRate" },
          { name: "averageSessionDuration" },
          { name: "conversions" },
          { name: "totalRevenue" },
        ],
      },
    }),
    analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: range.start, endDate: range.end }],
        dimensions: [{ name: "date" }, { name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
      },
    }),
    analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: range.start, endDate: range.end }],
        dimensions: [{ name: "date" }, { name: "deviceCategory" }],
        metrics: [{ name: "sessions" }],
      },
    }),
  ]);

  const byDate = new Map<string, DailyRow>();
  const parseGaDate = (raw: string) => `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;

  for (const row of totals.data.rows ?? []) {
    const date = parseGaDate(row.dimensionValues![0].value!);
    const m = row.metricValues!.map((v) => Number(v.value ?? 0));
    const sessions = m[0];
    const conversions = m[7];
    byDate.set(date, {
      date,
      sessions,
      users: m[1],
      newUsers: m[2],
      pageviews: m[3],
      bounceRate: m[4] * 100,
      engagementRate: m[5] * 100,
      avgSessionDuration: m[6],
      conversions,
      conversionRate: sessions > 0 ? (conversions / sessions) * 100 : 0,
      revenue: m[8],
    });
  }

  const CHANNEL_MAP: Record<string, string> = {
    "Organic Search": "sessionsOrganic",
    "Paid Search": "sessionsPaid",
    "Paid Social": "sessionsPaid",
    Direct: "sessionsDirect",
    Referral: "sessionsReferral",
    "Organic Social": "sessionsSocial",
    Email: "sessionsEmail",
  };
  for (const row of channelSplit.data.rows ?? []) {
    const date = parseGaDate(row.dimensionValues![0].value!);
    const channelGroup = row.dimensionValues![1].value ?? "";
    const key = CHANNEL_MAP[channelGroup] ?? "sessionsReferral";
    const sessions = Number(row.metricValues![0].value ?? 0);
    const existing = byDate.get(date);
    if (existing) existing[key] = ((existing[key] as number) ?? 0) + sessions;
  }

  const DEVICE_MAP: Record<string, string> = { desktop: "deviceDesktop", mobile: "deviceMobile", tablet: "deviceTablet" };
  for (const row of deviceSplit.data.rows ?? []) {
    const date = parseGaDate(row.dimensionValues![0].value!);
    const device = (row.dimensionValues![1].value ?? "").toLowerCase();
    const key = DEVICE_MAP[device] ?? "deviceDesktop";
    const sessions = Number(row.metricValues![0].value ?? 0);
    const existing = byDate.get(date);
    if (existing) existing[key] = ((existing[key] as number) ?? 0) + sessions;
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}
