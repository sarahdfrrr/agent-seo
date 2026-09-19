import { requireEnv } from "@/lib/env";

/**
 * LinkedIn organic connector (Community Management API). Requires a LinkedIn
 * app with the "Community Management API" product approved for your org
 * page — this review can take a few days.
 *  LINKEDIN_ACCESS_TOKEN   member/org access token with r_organization_social + rw_organization_admin
 *  LINKEDIN_ORG_URN        e.g. urn:li:organization:12345678
 */
export async function fetchLinkedInDaily(range: { start: string; end: string }) {
  const token = requireEnv("LINKEDIN_ACCESS_TOKEN");
  const orgUrn = requireEnv("LINKEDIN_ORG_URN");
  const startMs = Date.parse(range.start + "T00:00:00Z");
  const endMs = Date.parse(range.end + "T23:59:59Z");

  const url =
    `https://api.linkedin.com/rest/organizationalEntityFollowerStatistics` +
    `?q=organizationalEntity&organizationalEntity=${encodeURIComponent(orgUrn)}` +
    `&timeIntervals.timeGranularityType=DAY&timeIntervals.timeRange.start=${startMs}&timeIntervals.timeRange.end=${endMs}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "LinkedIn-Version": "202401" },
  });
  if (!res.ok) throw new Error(`LinkedIn API error: ${res.status} ${await res.text()}`);
  const json = await res.json();

  // Shape depends on the exact API version response — map elements[] into
  // { date, followers, followerGain, impressions, engagementRate } here.
  return json;
}
