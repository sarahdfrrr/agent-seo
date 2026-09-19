import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ChannelId } from "@/lib/types";
import { CHANNEL_BY_ID } from "@/lib/data/channels";
import { getChannelData } from "@/lib/data/getChannelData";
import { parseFilters } from "@/lib/utils/searchParams";

/**
 * JSON view of a single channel's dashboard data — same aggregation the UI
 * pages use. Handy to sanity-check a freshly wired-up live connector
 * (DATA_SOURCE_* env var) without opening the full dashboard:
 *   GET /api/data/ga4?preset=30d&granularity=day
 */
export async function GET(request: NextRequest, context: { params: Promise<{ channel: string }> }) {
  const { channel } = await context.params;

  if (!(channel in CHANNEL_BY_ID)) {
    return NextResponse.json(
      { error: `Canal inconnu: "${channel}". Attendu: ${Object.keys(CHANNEL_BY_ID).join(", ")}` },
      { status: 404 },
    );
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const filters = parseFilters(searchParams);

  try {
    const payload = await getChannelData(channel as ChannelId, filters);
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erreur inconnue" }, { status: 500 });
  }
}
