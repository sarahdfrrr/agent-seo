import { getChannelData } from "@/lib/data/getChannelData";
import { CHANNEL_BY_ID } from "@/lib/data/channels";
import { parseFilters } from "@/lib/utils/searchParams";
import { ChannelView } from "@/components/dashboard/ChannelView";

export const metadata = { title: "Google Ads — Pulse" };

export default async function AdsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filters = parseFilters(await searchParams);
  const payload = await getChannelData("ads", filters);
  return <ChannelView meta={CHANNEL_BY_ID.ads} payload={payload} />;
}
