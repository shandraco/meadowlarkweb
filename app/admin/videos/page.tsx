import { getContentJson } from "@/lib/content";
import FarmVideosEditor from "@/components/admin/FarmVideosEditor";
import type { VideosPayload } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Farm Videos | Meadowlark Admin" };

const DEFAULT: VideosPayload = {
  eyebrow: "Come see this in action",
  headline: "Small snippets.",
  emphasis: "Same farm.",
  videos: [],
};

export default async function VideosPage() {
  const block = await getContentJson<VideosPayload>("farm_videos", DEFAULT);

  return (
    <div>
      <p className="section-label mb-2">Homepage</p>
      <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none mb-3">Farm videos</h1>
      <p className="text-ink-soft font-light mb-10 max-w-2xl">
        Short clips shown between the story and the season reminders. They lazy-load — only the one on screen is
        streaming, so the page stays fast even with a handful of MP4s.
      </p>
      <FarmVideosEditor initial={block} />
    </div>
  );
}
