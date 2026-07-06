import HomeView from "@/components/home/HomeView";
import { getHomepageContent } from "@/lib/content";
import { getFarmStatus } from "@/lib/farm-hours";

// Server component — CMS content is fetched here so the client never sees
// a flash of default values while the DB call is in flight. The farm's
// open/closed status is computed server-side against Central time so a
// visitor's device clock doesn't lie about hours.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [content, farmStatus] = await Promise.all([getHomepageContent(), Promise.resolve(getFarmStatus())]);
  return <HomeView content={content} farmStatus={farmStatus} />;
}
