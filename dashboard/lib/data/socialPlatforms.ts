import type { ChannelPayload, KpiValue, SeriesPoint, TableRow } from "@/lib/types";

/**
 * Client-safe social-platform metadata and shapes. Kept separate from
 * getSocialData.ts (which pulls in server-only fetch/integration code via
 * getChannelData.ts) so SocialView.tsx — a client component — can import
 * the platform list without dragging that server-only graph into the
 * browser bundle.
 */
export type SocialPlatformId = "linkedin" | "instagram" | "youtube";

export const SOCIAL_PLATFORMS: { id: SocialPlatformId; label: string; color: string }[] = [
  { id: "linkedin", label: "LinkedIn", color: "var(--series-1)" },
  { id: "instagram", label: "Instagram", color: "var(--series-2)" },
  { id: "youtube", label: "YouTube", color: "var(--series-3)" },
];

export type SocialPlatformData = {
  id: SocialPlatformId;
  label: string;
  color: string;
  kpis: KpiValue[];
  trend: SeriesPoint[];
  posts: TableRow[];
};

export type SocialPayload = ChannelPayload & { platforms: SocialPlatformData[] };
