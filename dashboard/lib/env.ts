import type { ChannelId } from "@/lib/types";

export type DataSourceMode = "mock" | "live";

const ENV_KEY: Record<ChannelId, string> = {
  ga4: "DATA_SOURCE_GA4",
  seo: "DATA_SOURCE_SEO",
  ads: "DATA_SOURCE_ADS",
  email: "DATA_SOURCE_EMAIL",
  social: "DATA_SOURCE_SOCIAL",
};

/** Each channel can be switched to live data independently by setting its
 * DATA_SOURCE_* env var to "live" once the matching credentials are filled
 * in (see .env.example). Anything unset — or "mock" — stays on demo data. */
export function dataSourceMode(channel: ChannelId): DataSourceMode {
  const raw = process.env[ENV_KEY[channel]];
  return raw === "live" ? "live" : "mock";
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. Renseigne-la (voir .env.example) ou repasse ce canal en DATA_SOURCE_*=mock.`,
    );
  }
  return value;
}
