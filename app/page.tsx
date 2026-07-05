import HomeView from "@/components/home/HomeView";
import { getHomepageContent } from "@/lib/content";

// Server component — CMS content is fetched here so the client never sees
// a flash of default values while the DB call is in flight.
export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getHomepageContent();
  return <HomeView content={content} />;
}
