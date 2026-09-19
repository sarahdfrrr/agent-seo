import type { DailyRow } from "@/lib/types";
import { requireEnv } from "@/lib/env";

/**
 * Live Google Ads connector using the REST API directly (no SDK — the
 * official googleapis package doesn't cover Ads). Activate by setting
 * DATA_SOURCE_ADS=live plus:
 *  GOOGLE_ADS_DEVELOPER_TOKEN   from your Google Ads MCC (needs approval)
 *  GOOGLE_ADS_CLIENT_ID / GOOGLE_ADS_CLIENT_SECRET   OAuth app credentials
 *  GOOGLE_ADS_REFRESH_TOKEN     obtained once via OAuth consent flow
 *  GOOGLE_ADS_CUSTOMER_ID       10-digit account id, no dashes
 *  GOOGLE_ADS_LOGIN_CUSTOMER_ID optional, for MCC-managed accounts
 */
const API_VERSION = "v18";

async function getAccessToken(): Promise<string> {
  const clientId = requireEnv("GOOGLE_ADS_CLIENT_ID");
  const clientSecret = requireEnv("GOOGLE_ADS_CLIENT_SECRET");
  const refreshToken = requireEnv("GOOGLE_ADS_REFRESH_TOKEN");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google Ads OAuth refresh failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

async function gaqlSearch(query: string) {
  const customerId = requireEnv("GOOGLE_ADS_CUSTOMER_ID");
  const developerToken = requireEnv("GOOGLE_ADS_DEVELOPER_TOKEN");
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
  const accessToken = await getAccessToken();

  const res = await fetch(`https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}/googleAds:search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": developerToken,
      ...(loginCustomerId ? { "login-customer-id": loginCustomerId } : {}),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Google Ads API error: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { results?: Record<string, unknown>[] };
  return json.results ?? [];
}

export async function fetchGoogleAdsDailyRows(range: { start: string; end: string }): Promise<DailyRow[]> {
  const query = `
    SELECT segments.date, metrics.cost_micros, metrics.impressions, metrics.clicks,
           metrics.conversions, metrics.conversions_value
    FROM customer
    WHERE segments.date BETWEEN '${range.start}' AND '${range.end}'
    ORDER BY segments.date
  `;
  const results = await gaqlSearch(query);

  return results.map((r) => {
    const seg = r.segments as { date: string };
    const m = r.metrics as {
      costMicros: string;
      impressions: string;
      clicks: string;
      conversions: number;
      conversionsValue: number;
    };
    const spend = Number(m.costMicros ?? 0) / 1_000_000;
    const clicks = Number(m.clicks ?? 0);
    const impressions = Number(m.impressions ?? 0);
    const conversions = Number(m.conversions ?? 0);
    const conversionValue = Number(m.conversionsValue ?? 0);
    return {
      date: seg.date,
      spend,
      impressions,
      clicks,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      conversions,
      cpa: conversions > 0 ? spend / conversions : 0,
      conversionValue,
      roas: spend > 0 ? conversionValue / spend : 0,
    };
  });
}

export async function fetchGoogleAdsCampaigns(range: { start: string; end: string }) {
  const query = `
    SELECT campaign.name, metrics.cost_micros, metrics.conversions, metrics.conversions_value
    FROM campaign
    WHERE segments.date BETWEEN '${range.start}' AND '${range.end}'
    ORDER BY metrics.cost_micros DESC
  `;
  const results = await gaqlSearch(query);
  return results.map((r) => {
    const campaign = r.campaign as { name: string };
    const m = r.metrics as { costMicros: string; conversions: number; conversionsValue: number };
    const spend = Number(m.costMicros ?? 0) / 1_000_000;
    const conversions = Number(m.conversions ?? 0);
    return {
      campaign: campaign.name,
      spend: Math.round(spend),
      conversions: Math.round(conversions),
      cpa: conversions > 0 ? Math.round((spend / conversions) * 100) / 100 : 0,
      roas: spend > 0 ? Math.round((Number(m.conversionsValue ?? 0) / spend) * 10) / 10 : 0,
    };
  });
}
