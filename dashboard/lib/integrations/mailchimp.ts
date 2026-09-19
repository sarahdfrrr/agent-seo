import type { DailyRow } from "@/lib/types";
import { requireEnv } from "@/lib/env";

/**
 * Live Mailchimp connector using the Marketing API (plain REST, no SDK
 * needed). Activate by setting DATA_SOURCE_EMAIL=live plus:
 *  MAILCHIMP_API_KEY        ends in "-us21" etc. — the suffix is the server prefix
 *  MAILCHIMP_LIST_ID        the audience/list id
 *
 * Mailchimp doesn't expose a clean daily new-subscribers/unsubscribes feed:
 * `growth-history` is monthly. This connector builds daily rows from sent
 * campaigns (real, per-day) and spreads the monthly growth-history delta
 * evenly across that month's days as an approximation — swap in your ESP's
 * webhook/export if you need exact daily deltas.
 */
function apiBase() {
  const apiKey = requireEnv("MAILCHIMP_API_KEY");
  const serverPrefix = apiKey.split("-").pop();
  if (!serverPrefix) throw new Error("MAILCHIMP_API_KEY: impossible d'extraire le préfixe serveur (ex: xxxx-us21).");
  return { base: `https://${serverPrefix}.api.mailchimp.com/3.0`, apiKey };
}

async function mcFetch(path: string) {
  const { base, apiKey } = apiBase();
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}` },
  });
  if (!res.ok) throw new Error(`Mailchimp API error: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function fetchMailchimpDailyRows(range: { start: string; end: string }): Promise<DailyRow[]> {
  const listId = requireEnv("MAILCHIMP_LIST_ID");

  const [growthHistory, campaigns, listInfo] = await Promise.all([
    mcFetch(`/lists/${listId}/growth-history?count=24`) as Promise<{
      history: { month: string; existing: number; imports: number; optins: number }[];
    }>,
    mcFetch(
      `/campaigns?list_id=${listId}&status=sent&since_send_time=${range.start}T00:00:00Z&before_send_time=${range.end}T23:59:59Z&count=100`,
    ) as Promise<{ campaigns: { id: string; send_time: string; emails_sent: number }[] }>,
    mcFetch(`/lists/${listId}`) as Promise<{ stats: { member_count: number } }>,
  ]);

  const byDate = new Map<string, DailyRow>();
  // Mailchimp doesn't expose a historical subscriber-count series, only the
  // current snapshot — reused as a flat approximation across the range.
  const runningSubscribers = listInfo.stats.member_count;

  for (const month of growthHistory.history) {
    const monthStart = `${month.month}-01`;
    if (monthStart < range.start.slice(0, 8) + "01" && monthStart < range.start) continue;
    const netGrowth = month.imports + month.optins;
    const daysInMonth = new Date(Number(month.month.slice(0, 4)), Number(month.month.slice(5, 7)), 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${month.month}-${String(d).padStart(2, "0")}`;
      if (date < range.start || date > range.end) continue;
      byDate.set(date, {
        date,
        subscribers: runningSubscribers,
        newSubscribers: netGrowth / daysInMonth,
        unsubscribes: 0,
        campaignsSent: 0,
        recipients: 0,
        opens: 0,
        clicks: 0,
        openRate: 0,
        clickRate: 0,
      });
    }
  }

  for (const campaign of campaigns.campaigns) {
    const date = campaign.send_time.slice(0, 10);
    const report = (await mcFetch(`/reports/${campaign.id}`)) as {
      opens: { opens_total: number };
      clicks: { clicks_total: number };
      emails_sent: number;
    };
    const existing = byDate.get(date) ?? { date, subscribers: runningSubscribers, newSubscribers: 0, unsubscribes: 0, campaignsSent: 0, recipients: 0, opens: 0, clicks: 0, openRate: 0, clickRate: 0 };
    existing.campaignsSent = ((existing.campaignsSent as number) ?? 0) + 1;
    existing.recipients = ((existing.recipients as number) ?? 0) + report.emails_sent;
    existing.opens = ((existing.opens as number) ?? 0) + report.opens.opens_total;
    existing.clicks = ((existing.clicks as number) ?? 0) + report.clicks.clicks_total;
    const recipients = existing.recipients as number;
    existing.openRate = recipients > 0 ? ((existing.opens as number) / recipients) * 100 : 0;
    existing.clickRate = recipients > 0 ? ((existing.clicks as number) / recipients) * 100 : 0;
    byDate.set(date, existing);
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchMailchimpCampaigns(limit = 10) {
  const listId = requireEnv("MAILCHIMP_LIST_ID");
  const data = (await mcFetch(`/campaigns?list_id=${listId}&status=sent&sort_field=send_time&sort_dir=DESC&count=${limit}`)) as {
    campaigns: { id: string; settings: { subject_line: string }; emails_sent: number }[];
  };

  return Promise.all(
    data.campaigns.map(async (c) => {
      const report = (await mcFetch(`/reports/${c.id}`)) as { opens: { open_rate: number }; clicks: { click_rate: number } };
      return {
        subject: c.settings.subject_line,
        recipients: c.emails_sent,
        openRate: Math.round(report.opens.open_rate * 1000) / 10,
        clickRate: Math.round(report.clicks.click_rate * 1000) / 10,
      };
    }),
  );
}
