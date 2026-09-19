import type { DailyRow } from "@/lib/types";
import { daysSinceEpoch, seededUnit, seriesValue } from "@/lib/mock/random";

// Fixed anchors (not relative to "today") so any calendar date always maps
// to the same point on the growth curve, however far back a range reaches.
const GROWTH_START = daysSinceEpoch("2024-01-01");
const GROWTH_END = daysSinceEpoch("2027-06-01");

function ordinal(dateISO: string) {
  return daysSinceEpoch(dateISO) - GROWTH_START;
}
const TOTAL_DAYS = GROWTH_END - GROWTH_START;

function seriesOpts(seedKey: string, date: string, base: number, extra: Partial<Parameters<typeof seriesValue>[0]> = {}) {
  return seriesValue({
    seedKey,
    date,
    ordinal: ordinal(date),
    totalDays: TOTAL_DAYS,
    base,
    ...extra,
  });
}

/** Splits a total across weighted buckets with mild daily jitter, summing back to `total`. */
function splitWeighted(total: number, weights: Record<string, number>, date: string, seedKey: string): Record<string, number> {
  const entries = Object.entries(weights);
  const weightSum = entries.reduce((s, [, w]) => s + w, 0);
  const jittered = entries.map(([k, w]) => {
    const noise = 1 + (seededUnit(`${seedKey}:${k}:${date}`) - 0.5) * 0.3;
    return [k, (w / weightSum) * noise] as const;
  });
  const jitteredSum = jittered.reduce((s, [, w]) => s + w, 0);
  const out: Record<string, number> = {};
  for (const [k, w] of jittered) {
    out[k] = total * (w / jitteredSum);
  }
  return out;
}

// ---------------------------------------------------------------------------
// GA4 — Google Analytics
// ---------------------------------------------------------------------------

export function generateGA4(dates: string[]): DailyRow[] {
  return dates.map((date) => {
    const sessions = seriesOpts("ga4:sessions", date, 1450, {
      growthStart: 0.7,
      growthEnd: 1.55,
      weekendDip: 0.32,
      noisePct: 0.1,
      spikeChance: 0.02,
      spikeMultiplier: 2.1,
    });
    const split = splitWeighted(
      sessions,
      { organic: 0.4, paid: 0.16, direct: 0.18, referral: 0.08, social: 0.1, email: 0.08 },
      date,
      "ga4:split",
    );
    const newUserRatio = 0.58 + seededUnit(`ga4:newratio:${date}`) * 0.1;
    const users = sessions * (0.86 + seededUnit(`ga4:usersratio:${date}`) * 0.05);
    const newUsers = users * newUserRatio;
    const pagesPerSession = 2.1 + seededUnit(`ga4:ppv:${date}`) * 0.9;
    const pageviews = sessions * pagesPerSession;
    const bounceRate = seriesOpts("ga4:bounce", date, 48, { growthStart: 1.08, growthEnd: 0.88, weekendDip: -0.05, noisePct: 0.06 });
    const engagementRate = Math.min(92, 100 - bounceRate * 0.92);
    const avgSessionDuration = seriesOpts("ga4:duration", date, 145, { growthStart: 0.9, growthEnd: 1.2, noisePct: 0.12 });
    const conversionRate = seriesOpts("ga4:convrate", date, 2.6, { growthStart: 0.85, growthEnd: 1.35, noisePct: 0.15, weekendDip: 0.1 });
    const conversions = sessions * (conversionRate / 100);
    const aov = 78 + seededUnit(`ga4:aov:${date}`) * 24;
    const revenue = conversions * aov;
    const deviceSplit = splitWeighted(sessions, { desktop: 0.52, mobile: 0.4, tablet: 0.08 }, date, "ga4:device");

    return {
      date,
      sessions,
      users,
      newUsers,
      pageviews,
      bounceRate,
      engagementRate,
      avgSessionDuration,
      conversions,
      conversionRate,
      revenue,
      sessionsOrganic: split.organic,
      sessionsPaid: split.paid,
      sessionsDirect: split.direct,
      sessionsReferral: split.referral,
      sessionsSocial: split.social,
      sessionsEmail: split.email,
      deviceDesktop: deviceSplit.desktop,
      deviceMobile: deviceSplit.mobile,
      deviceTablet: deviceSplit.tablet,
    };
  });
}

// ---------------------------------------------------------------------------
// SEO — Search Console + organic
// ---------------------------------------------------------------------------

export function generateSEO(dates: string[]): DailyRow[] {
  return dates.map((date) => {
    const impressions = seriesOpts("seo:impressions", date, 9800, {
      growthStart: 0.55,
      growthEnd: 1.8,
      weekendDip: 0.22,
      noisePct: 0.09,
    });
    const ctrBase = seriesOpts("seo:ctr", date, 4.4, { growthStart: 0.85, growthEnd: 1.3, noisePct: 0.1 });
    const clicks = impressions * (ctrBase / 100);
    const avgPosition = seriesOpts("seo:position", date, 16.5, { growthStart: 1.25, growthEnd: 0.62, noisePct: 0.07, min: 3 });
    const organicSessions = clicks * (1.04 + seededUnit(`seo:sessions:${date}`) * 0.08);
    const indexedPages = Math.round(seriesOpts("seo:indexed", date, 210, { growthStart: 0.6, growthEnd: 1.9, noisePct: 0.02, weekendDip: 0 }));

    return {
      date,
      impressions,
      clicks,
      ctr: (clicks / impressions) * 100,
      avgPosition,
      organicSessions,
      indexedPages,
    };
  });
}

const SEO_QUERIES = [
  "logiciel gestion projet",
  "outil crm gratuit",
  "formation marketing digital",
  "meilleur crm pme",
  "agence seo b2b",
  "logiciel facturation en ligne",
  "template dashboard marketing",
  "kpi marketing a suivre",
  "comment mesurer roi marketing",
  "logiciel automatisation marketing",
  "exemple reporting marketing",
  "outil suivi seo",
];

const SEO_PAGES = [
  "/blog/kpi-marketing-guide",
  "/blog/comment-mesurer-roi-marketing",
  "/pricing",
  "/blog/logiciel-crm-comparatif",
  "/blog/automatisation-marketing-guide",
  "/features/reporting",
  "/blog/dashboard-marketing-exemples",
  "/",
];

export function generateSEOQueries(seedSuffix = ""): { query: string; clicks: number; impressions: number; ctr: number; position: number }[] {
  return SEO_QUERIES.map((query) => {
    const impressions = Math.round(400 + seededUnit(`seoq:imp:${query}${seedSuffix}`) * 6200);
    const position = Math.round((2 + seededUnit(`seoq:pos:${query}${seedSuffix}`) * 22) * 10) / 10;
    const ctr = Math.max(0.5, 22 - position * 0.7 + seededUnit(`seoq:ctr:${query}${seedSuffix}`) * 4);
    const clicks = Math.round(impressions * (ctr / 100));
    return { query, clicks, impressions, ctr: Math.round(ctr * 10) / 10, position };
  }).sort((a, b) => b.clicks - a.clicks);
}

export function generateSEOPages(seedSuffix = ""): { page: string; sessions: number; conversions: number }[] {
  return SEO_PAGES.map((page) => {
    const sessions = Math.round(180 + seededUnit(`seop:sess:${page}${seedSuffix}`) * 3400);
    const conversions = Math.round(sessions * (0.01 + seededUnit(`seop:cvr:${page}${seedSuffix}`) * 0.05));
    return { page, sessions, conversions };
  }).sort((a, b) => b.sessions - a.sessions);
}

// ---------------------------------------------------------------------------
// Google Ads
// ---------------------------------------------------------------------------

export function generateAds(dates: string[]): DailyRow[] {
  return dates.map((date) => {
    const spend = seriesOpts("ads:spend", date, 320, {
      growthStart: 0.6,
      growthEnd: 1.7,
      weekendDip: 0.35,
      noisePct: 0.14,
      spikeChance: 0.015,
      spikeMultiplier: 1.8,
    });
    const cpc = seriesOpts("ads:cpc", date, 1.35, { growthStart: 0.9, growthEnd: 1.2, noisePct: 0.1 });
    const clicks = spend / cpc;
    const ctr = seriesOpts("ads:ctr", date, 3.4, { growthStart: 0.9, growthEnd: 1.15, noisePct: 0.1 });
    const impressions = clicks / (ctr / 100);
    const convRate = seriesOpts("ads:convrate", date, 4.8, { growthStart: 0.8, growthEnd: 1.4, noisePct: 0.16 });
    const conversions = clicks * (convRate / 100);
    const roasBase = seriesOpts("ads:roas", date, 3.1, { growthStart: 0.82, growthEnd: 1.3, noisePct: 0.12 });
    const conversionValue = spend * roasBase;

    return {
      date,
      spend,
      impressions,
      clicks,
      ctr,
      cpc: spend / Math.max(1, clicks),
      conversions,
      cpa: spend / Math.max(0.01, conversions),
      conversionValue,
      roas: conversionValue / Math.max(1, spend),
    };
  });
}

const AD_CAMPAIGNS = [
  { name: "Brand — Recherche", weight: 0.22 },
  { name: "Générique — Recherche", weight: 0.34 },
  { name: "Concurrents — Recherche", weight: 0.14 },
  { name: "Remarketing — Display", weight: 0.12 },
  { name: "Prospection — Performance Max", weight: 0.18 },
];

export function generateAdCampaigns(totalSpend: number, totalConversions: number, seedSuffix = "") {
  return AD_CAMPAIGNS.map((c) => {
    // Independent jitter for spend vs. conversions so CPA varies per
    // campaign instead of collapsing to the same portfolio-wide average.
    const spendJitter = 1 + (seededUnit(`ads:camp:spend:${c.name}${seedSuffix}`) - 0.5) * 0.3;
    const convJitter = 1 + (seededUnit(`ads:camp:conv:${c.name}${seedSuffix}`) - 0.5) * 0.5;
    const spend = Math.round(totalSpend * c.weight * spendJitter);
    const conversions = Math.max(1, Math.round(totalConversions * c.weight * convJitter));
    return {
      campaign: c.name,
      spend,
      conversions,
      cpa: Math.round((spend / conversions) * 100) / 100,
      roas: Math.round((2.2 + seededUnit(`ads:camproas:${c.name}${seedSuffix}`) * 2.4) * 10) / 10,
    };
  }).sort((a, b) => b.spend - a.spend);
}

// ---------------------------------------------------------------------------
// Email — Mailchimp
// ---------------------------------------------------------------------------

export function generateEmail(dates: string[]): DailyRow[] {
  let subscribers = 4200;
  return dates.map((date) => {
    const dow = new Date(date + "T00:00:00Z").getUTCDay();
    const isSendDay = dow === 2 || dow === 4; // Tuesday & Thursday newsletters
    const newSubs = seriesOpts("email:newsubs", date, 9, { growthStart: 0.7, growthEnd: 1.6, weekendDip: 0.4, noisePct: 0.25 });
    const unsubs = seriesOpts("email:unsubs", date, 2.4, { growthStart: 1, growthEnd: 1, noisePct: 0.3, weekendDip: 0.2 });
    subscribers = Math.max(0, subscribers + newSubs - unsubs);

    let campaignsSent = 0;
    let recipients = 0;
    let opens = 0;
    let clicks = 0;
    if (isSendDay) {
      campaignsSent = 1;
      recipients = subscribers * (0.97 + seededUnit(`email:reach:${date}`) * 0.02);
      const openRate = seriesOpts("email:openrate", date, 32, { growthStart: 0.95, growthEnd: 1.1, noisePct: 0.12 });
      opens = recipients * (openRate / 100);
      const clickRate = seriesOpts("email:clickrate", date, 4.2, { growthStart: 0.9, growthEnd: 1.25, noisePct: 0.18 });
      clicks = recipients * (clickRate / 100);
    }

    return {
      date,
      subscribers,
      newSubscribers: newSubs,
      unsubscribes: unsubs,
      campaignsSent,
      recipients,
      opens,
      clicks,
      openRate: recipients > 0 ? (opens / recipients) * 100 : 0,
      clickRate: recipients > 0 ? (clicks / recipients) * 100 : 0,
    };
  });
}

const EMAIL_CAMPAIGNS = [
  "Newsletter — Nouveautés produit",
  "Newsletter — Étude de cas client",
  "Promo — Offre de rentrée",
  "Newsletter — Guide KPI marketing",
  "Relance — Essai gratuit",
  "Newsletter — Webinar replay",
];

export function generateEmailCampaigns(seedSuffix = "") {
  return EMAIL_CAMPAIGNS.map((subject) => {
    const recipients = Math.round(3800 + seededUnit(`emailc:rec:${subject}${seedSuffix}`) * 1800);
    const openRate = Math.round((26 + seededUnit(`emailc:open:${subject}${seedSuffix}`) * 20) * 10) / 10;
    const clickRate = Math.round((2 + seededUnit(`emailc:click:${subject}${seedSuffix}`) * 6) * 10) / 10;
    return { subject, recipients, openRate, clickRate };
  });
}

// ---------------------------------------------------------------------------
// Social — LinkedIn, Instagram, YouTube (organic)
// ---------------------------------------------------------------------------

const SOCIAL_PLATFORMS = ["linkedin", "instagram", "youtube"] as const;
const SOCIAL_BASE_FOLLOWERS: Record<(typeof SOCIAL_PLATFORMS)[number], number> = {
  linkedin: 3100,
  instagram: 5400,
  youtube: 980,
};

export function generateSocial(dates: string[]): DailyRow[] {
  const followerState: Record<string, number> = { ...SOCIAL_BASE_FOLLOWERS };

  return dates.map((date) => {
    const row: DailyRow = { date };
    let totalFollowersGain = 0;
    let totalImpressions = 0;
    let totalEngagements = 0;
    let totalVideoViews = 0;

    for (const platform of SOCIAL_PLATFORMS) {
      const gain = seriesOpts(`social:${platform}:gain`, date, platform === "instagram" ? 14 : platform === "linkedin" ? 11 : 6, {
        growthStart: 0.6,
        growthEnd: 1.9,
        weekendDip: platform === "linkedin" ? 0.5 : -0.1,
        noisePct: 0.35,
        spikeChance: 0.02,
        spikeMultiplier: 3,
      });
      followerState[platform] += gain;
      const impressions = seriesOpts(`social:${platform}:impressions`, date, platform === "instagram" ? 4200 : platform === "linkedin" ? 2600 : 1500, {
        growthStart: 0.65,
        growthEnd: 1.7,
        weekendDip: platform === "linkedin" ? 0.4 : -0.05,
        noisePct: 0.22,
        spikeChance: 0.025,
        spikeMultiplier: 2.4,
      });
      const engagementRate = seriesOpts(`social:${platform}:engrate`, date, 3.2, { growthStart: 0.9, growthEnd: 1.2, noisePct: 0.2 });
      const engagements = impressions * (engagementRate / 100);

      row[`${platform}Followers`] = followerState[platform];
      row[`${platform}FollowerGain`] = gain;
      row[`${platform}Impressions`] = impressions;
      row[`${platform}Engagements`] = engagements;
      row[`${platform}EngagementRate`] = engagementRate;

      totalFollowersGain += gain;
      totalImpressions += impressions;
      totalEngagements += engagements;

      if (platform === "youtube") {
        const videoViews = impressions * (2.1 + seededUnit(`social:yt:views:${date}`) * 1.4);
        row.youtubeViews = videoViews;
        totalVideoViews += videoViews;
      }
    }

    row.totalFollowers = SOCIAL_PLATFORMS.reduce((s, p) => s + (followerState[p] as number), 0);
    row.followerGain = totalFollowersGain;
    row.impressions = totalImpressions;
    row.engagements = totalEngagements;
    row.engagementRate = (totalEngagements / Math.max(1, totalImpressions)) * 100;
    row.videoViews = totalVideoViews;

    return row;
  });
}

const SOCIAL_POSTS = [
  { platform: "LinkedIn", title: "5 KPI que tout CMO devrait suivre chaque semaine" },
  { platform: "Instagram", title: "Behind the scenes : notre équipe growth" },
  { platform: "YouTube", title: "Tuto : construire son dashboard marketing en 10 min" },
  { platform: "LinkedIn", title: "Étude de cas : +40% de leads en 3 mois" },
  { platform: "Instagram", title: "Carrousel : 7 erreurs SEO à éviter" },
];

export function generateTopPosts(seedSuffix = "") {
  return SOCIAL_POSTS.map((p) => {
    const impressions = Math.round(1800 + seededUnit(`post:imp:${p.title}${seedSuffix}`) * 24000);
    const engagementRate = Math.round((2 + seededUnit(`post:eng:${p.title}${seedSuffix}`) * 9) * 10) / 10;
    return { ...p, impressions, engagementRate };
  }).sort((a, b) => b.impressions - a.impressions);
}
