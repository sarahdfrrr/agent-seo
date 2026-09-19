import { getChannelData } from "@/lib/data/getChannelData";
import { CHANNEL_BY_ID } from "@/lib/data/channels";
import { parseFilters } from "@/lib/utils/searchParams";
import { ChannelView } from "@/components/dashboard/ChannelView";

export const metadata = { title: "SEO — Pulse" };

export default async function SeoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { preset, granularity } = parseFilters(await searchParams);
  const payload = await getChannelData("seo", preset, granularity);
  return <ChannelView meta={CHANNEL_BY_ID.seo} payload={payload} />;
}
