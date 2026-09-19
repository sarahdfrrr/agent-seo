import type { ChannelId, MetricDefinition, MetricFormat } from "@/lib/types";

export type TrendChartConfig = {
  title: string;
  keys: string[];
  labels: Record<string, string>;
  format: MetricFormat;
};

export type ChannelMeta = {
  id: ChannelId;
  label: string;
  shortLabel: string;
  route: string;
  color: string; // CSS var token
  description: string;
  overviewMetricKey: string;
  /** One entry per chart. Kept single-metric-per-axis-scale (see dataviz
   * skill: never mix measures of different scale on one axis) — a channel
   * whose KPIs span very different magnitudes (clicks vs impressions, spend
   * vs conversions) gets two small-multiple charts instead of one dual-axis
   * chart. A channel with same-unit series (sessions by source, impressions
   * by platform) gets one multi-series chart. */
  trendCharts: TrendChartConfig[];
};

export const CHANNELS: ChannelMeta[] = [
  {
    id: "ga4",
    label: "Google Analytics",
    shortLabel: "Analytics",
    route: "/analytics",
    color: "var(--series-1)",
    description: "Trafic, engagement et conversions sur l'ensemble du site.",
    overviewMetricKey: "sessions",
    trendCharts: [
      {
        title: "Sessions par canal d'acquisition",
        keys: ["sessionsOrganic", "sessionsPaid", "sessionsDirect", "sessionsSocial", "sessionsEmail", "sessionsReferral"],
        labels: {
          sessionsOrganic: "Organique",
          sessionsPaid: "Payant",
          sessionsDirect: "Direct",
          sessionsSocial: "Social",
          sessionsEmail: "Email",
          sessionsReferral: "Référent",
        },
        format: "number",
      },
    ],
  },
  {
    id: "seo",
    label: "SEO & Organique",
    shortLabel: "SEO",
    route: "/seo",
    color: "var(--series-3)",
    description: "Performance dans les résultats de recherche (Google Search Console).",
    overviewMetricKey: "clicks",
    trendCharts: [
      { title: "Clics", keys: ["clicks"], labels: { clicks: "Clics" }, format: "number" },
      { title: "Impressions", keys: ["impressions"], labels: { impressions: "Impressions" }, format: "number" },
    ],
  },
  {
    id: "ads",
    label: "Google Ads",
    shortLabel: "Ads",
    route: "/ads",
    color: "var(--series-2)",
    description: "Performance des campagnes de publicité payante.",
    overviewMetricKey: "spend",
    trendCharts: [
      { title: "Dépense", keys: ["spend"], labels: { spend: "Dépense" }, format: "currency" },
      { title: "Conversions", keys: ["conversions"], labels: { conversions: "Conversions" }, format: "number" },
    ],
  },
  {
    id: "email",
    label: "Email (Mailchimp)",
    shortLabel: "Email",
    route: "/email",
    color: "var(--series-5)",
    description: "Croissance de liste et performance des campagnes email.",
    overviewMetricKey: "subscribers",
    trendCharts: [{ title: "Abonnés", keys: ["subscribers"], labels: { subscribers: "Abonnés" }, format: "number" }],
  },
  {
    id: "social",
    label: "Réseaux sociaux",
    shortLabel: "Social",
    route: "/social",
    color: "var(--series-7)",
    description: "LinkedIn, Instagram et YouTube — portée et engagement organiques.",
    overviewMetricKey: "totalFollowers",
    trendCharts: [
      {
        title: "Impressions par plateforme",
        keys: ["linkedinImpressions", "instagramImpressions", "youtubeImpressions"],
        labels: { linkedinImpressions: "LinkedIn", instagramImpressions: "Instagram", youtubeImpressions: "YouTube" },
        format: "number",
      },
    ],
  },
];

export const CHANNEL_BY_ID: Record<ChannelId, ChannelMeta> = Object.fromEntries(
  CHANNELS.map((c) => [c.id, c]),
) as Record<ChannelId, ChannelMeta>;

export const KPI_DEFS: Record<ChannelId, MetricDefinition[]> = {
  ga4: [
    { key: "sessions", label: "Sessions", format: "number", aggregation: "sum", color: "var(--series-1)" },
    { key: "users", label: "Utilisateurs", format: "number", aggregation: "sum" },
    { key: "newUsers", label: "Nouveaux utilisateurs", format: "number", aggregation: "sum" },
    { key: "pageviews", label: "Pages vues", format: "number", aggregation: "sum" },
    { key: "engagementRate", label: "Taux d'engagement", format: "percent", aggregation: "avg-weighted", weightKey: "sessions" },
    { key: "bounceRate", label: "Taux de rebond", format: "percent", aggregation: "avg-weighted", weightKey: "sessions", lowerIsBetter: true },
    { key: "avgSessionDuration", label: "Durée moyenne session", format: "duration", aggregation: "avg-weighted", weightKey: "sessions" },
    { key: "conversions", label: "Conversions", format: "number", aggregation: "sum" },
    { key: "conversionRate", label: "Taux de conversion", format: "percent", aggregation: "ratio", numeratorKey: "conversions", denominatorKey: "sessions" },
    { key: "revenue", label: "Revenu", format: "currency", aggregation: "sum" },
  ],
  seo: [
    { key: "clicks", label: "Clics organiques", format: "number", aggregation: "sum", color: "var(--series-3)" },
    { key: "impressions", label: "Impressions", format: "number", aggregation: "sum" },
    { key: "ctr", label: "CTR moyen", format: "percent", aggregation: "ratio", numeratorKey: "clicks", denominatorKey: "impressions" },
    { key: "avgPosition", label: "Position moyenne", format: "decimal", aggregation: "avg-weighted", weightKey: "impressions", lowerIsBetter: true },
    { key: "organicSessions", label: "Sessions organiques", format: "number", aggregation: "sum" },
    { key: "indexedPages", label: "Pages indexées", format: "number", aggregation: "avg" },
  ],
  ads: [
    { key: "spend", label: "Dépense", format: "currency", aggregation: "sum", color: "var(--series-2)" },
    { key: "impressions", label: "Impressions", format: "number", aggregation: "sum" },
    { key: "clicks", label: "Clics", format: "number", aggregation: "sum" },
    { key: "ctr", label: "CTR", format: "percent", aggregation: "ratio", numeratorKey: "clicks", denominatorKey: "impressions" },
    { key: "cpc", label: "CPC moyen", format: "currency", aggregation: "ratio", numeratorKey: "spend", denominatorKey: "clicks", lowerIsBetter: true },
    { key: "conversions", label: "Conversions", format: "number", aggregation: "sum" },
    { key: "cpa", label: "Coût par conversion", format: "currency", aggregation: "ratio", numeratorKey: "spend", denominatorKey: "conversions", lowerIsBetter: true },
    { key: "roas", label: "ROAS", format: "decimal", aggregation: "ratio", numeratorKey: "conversionValue", denominatorKey: "spend" },
  ],
  email: [
    { key: "subscribers", label: "Abonnés", format: "number", aggregation: "avg", color: "var(--series-5)" },
    { key: "newSubscribers", label: "Nouveaux abonnés", format: "number", aggregation: "sum" },
    { key: "unsubscribes", label: "Désabonnements", format: "number", aggregation: "sum", lowerIsBetter: true },
    { key: "campaignsSent", label: "Campagnes envoyées", format: "number", aggregation: "sum" },
    { key: "openRate", label: "Taux d'ouverture moyen", format: "percent", aggregation: "ratio", numeratorKey: "opens", denominatorKey: "recipients" },
    { key: "clickRate", label: "Taux de clic moyen", format: "percent", aggregation: "ratio", numeratorKey: "clicks", denominatorKey: "recipients" },
  ],
  social: [
    { key: "totalFollowers", label: "Abonnés totaux", format: "number", aggregation: "avg", color: "var(--series-7)" },
    { key: "followerGain", label: "Nouveaux abonnés", format: "number", aggregation: "sum" },
    { key: "impressions", label: "Impressions", format: "number", aggregation: "sum" },
    { key: "engagements", label: "Engagements", format: "number", aggregation: "sum" },
    { key: "engagementRate", label: "Taux d'engagement", format: "percent", aggregation: "ratio", numeratorKey: "engagements", denominatorKey: "impressions" },
    { key: "videoViews", label: "Vues vidéo (YouTube)", format: "number", aggregation: "sum" },
  ],
};

export const KPI_DEFS_BY_KEY: Record<ChannelId, Record<string, MetricDefinition>> = Object.fromEntries(
  Object.entries(KPI_DEFS).map(([channel, defs]) => [channel, Object.fromEntries(defs.map((d) => [d.key, d]))]),
) as Record<ChannelId, Record<string, MetricDefinition>>;
