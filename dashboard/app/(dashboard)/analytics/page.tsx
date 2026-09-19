import { getChannelData } from "@/lib/data/getChannelData";
import { CHANNEL_BY_ID } from "@/lib/data/channels";
import { parseFilters } from "@/lib/utils/searchParams";
import { ChannelView } from "@/components/dashboard/ChannelView";

export const metadata = { title: "Analytics — Pulse" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filters = parseFilters(await searchParams);
  const payload = await getChannelData("ga4", filters);
  return <ChannelView meta={CHANNEL_BY_ID.ga4} payload={payload} />;
}
