import { google } from "googleapis";
import { requireEnv } from "@/lib/env";
import { getGoogleAuth } from "@/lib/integrations/google-auth";

/**
 * YouTube organic connector. Channel-level daily views/subscribersGained
 * need the YouTube Analytics API (OAuth — the same Google service account
 * works if added as a channel manager in YouTube Studio > Settings >
 * Permissions).
 *  YOUTUBE_CHANNEL_ID
 */
export async function fetchYouTubeDaily(range: { start: string; end: string }) {
  const channelId = requireEnv("YOUTUBE_CHANNEL_ID");
  const auth = getGoogleAuth(["https://www.googleapis.com/auth/yt-analytics.readonly"]);
  const youtubeAnalytics = google.youtubeAnalytics({ version: "v2", auth });

  const res = await youtubeAnalytics.reports.query({
    ids: `channel==${channelId}`,
    startDate: range.start,
    endDate: range.end,
    metrics: "views,subscribersGained,subscribersLost,estimatedMinutesWatched",
    dimensions: "day",
    sort: "day",
  });

  const rows = res.data.rows ?? [];
  return rows.map((r) => ({
    date: String(r[0]),
    videoViews: Number(r[1] ?? 0),
    youtubeFollowerGain: Number(r[2] ?? 0) - Number(r[3] ?? 0),
    watchMinutes: Number(r[4] ?? 0),
  }));
}
