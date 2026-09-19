import { google } from "googleapis";
import type { DailyRow } from "@/lib/types";
import { requireEnv } from "@/lib/env";
import { getGoogleAuth } from "@/lib/integrations/google-auth";

/**
 * Live Search Console connector. Activate by setting DATA_SOURCE_SEO=live
 * plus GSC_SITE_URL (exactly as it appears in Search Console — including the
 * sc-domain: prefix for a domain property) and the Google service-account
 * env vars.
 *
 * Note: `indexedPages` isn't available from searchanalytics.query — wire up
 * the URL Inspection API or the Index Coverage report if you need it; here
 * it's left at 0.
 */
export async function fetchGSCDailyRows(range: { start: string; end: string }): Promise<DailyRow[]> {
  const siteUrl = requireEnv("GSC_SITE_URL");
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/webmasters.readonly"]);
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: range.start,
      endDate: range.end,
      dimensions: ["date"],
      rowLimit: 25000,
    },
  });

  return (res.data.rows ?? []).map((row) => {
    const date = row.keys![0];
    const clicks = row.clicks ?? 0;
    const impressions = row.impressions ?? 0;
    return {
      date,
      clicks,
      impressions,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      avgPosition: row.position ?? 0,
      organicSessions: clicks,
      indexedPages: 0,
    };
  });
}

export async function fetchGSCQueries(range: { start: string; end: string }, limit = 25) {
  const siteUrl = requireEnv("GSC_SITE_URL");
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/webmasters.readonly"]);
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: range.start,
      endDate: range.end,
      dimensions: ["query"],
      rowLimit: limit,
    },
  });

  return (res.data.rows ?? []).map((row) => ({
    query: row.keys![0],
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: Math.round((row.ctr ?? 0) * 1000) / 10,
    position: Math.round((row.position ?? 0) * 10) / 10,
  }));
}

export async function fetchGSCPages(range: { start: string; end: string }, limit = 25) {
  const siteUrl = requireEnv("GSC_SITE_URL");
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/webmasters.readonly"]);
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: range.start,
      endDate: range.end,
      dimensions: ["page"],
      rowLimit: limit,
    },
  });

  return (res.data.rows ?? []).map((row) => ({
    page: row.keys![0],
    sessions: row.clicks ?? 0,
    conversions: 0, // not available from Search Console — join with GA4 if needed
  }));
}
