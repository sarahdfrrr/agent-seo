import { getSocialData } from "@/lib/data/getSocialData";
import { CHANNEL_BY_ID } from "@/lib/data/channels";
import { parseFilters } from "@/lib/utils/searchParams";
import { SocialView } from "@/components/dashboard/SocialView";

export const metadata = { title: "Réseaux sociaux — Pulse" };

export default async function SocialPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filters = parseFilters(await searchParams);
  const payload = await getSocialData(filters);
  return <SocialView meta={CHANNEL_BY_ID.social} payload={payload} />;
}
