import { requireEnv } from "@/lib/env";

/**
 * Instagram organic connector (Instagram Graph API via Facebook Graph).
 * Requires a Facebook App in Live mode with instagram_basic +
 * instagram_manage_insights permissions (App Review) and a Business/Creator
 * IG account linked to a Facebook Page.
 *  INSTAGRAM_ACCESS_TOKEN   long-lived Page access token
 *  INSTAGRAM_USER_ID        the IG Business account id (not the @handle)
 */
export async function fetchInstagramDaily(range: { start: string; end: string }) {
  const token = requireEnv("INSTAGRAM_ACCESS_TOKEN");
  const igUserId = requireEnv("INSTAGRAM_USER_ID");
  const since = Math.floor(Date.parse(range.start + "T00:00:00Z") / 1000);
  const until = Math.floor(Date.parse(range.end + "T23:59:59Z") / 1000);

  const url =
    `https://graph.facebook.com/v19.0/${igUserId}/insights` +
    `?metric=impressions,reach,follower_count&period=day&since=${since}&until=${until}&access_token=${token}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Instagram Graph API error: ${res.status} ${await res.text()}`);
  const json = await res.json();

  // json.data[] holds one entry per metric, each with a values[] time series
  // keyed by end_time — map into { date, impressions, followers } here.
  return json;
}
