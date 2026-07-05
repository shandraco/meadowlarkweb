import { CONTENT_BLOCKS } from "@/lib/content-types";
import { getContentMap } from "@/lib/content";
import ContentEditor from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

export default async function AdminContent() {
  const map = await getContentMap(CONTENT_BLOCKS.map((b) => b.key));

  return (
    <div>
      <p className="section-label mb-2">Website</p>
      <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none mb-3">Site Content</h1>
      <p className="text-ink-soft font-light mb-10">Edit the homepage copy. Changes go live immediately.</p>

      <div className="max-w-3xl">
        {CONTENT_BLOCKS.map((b) => (
          <ContentEditor
            key={b.key}
            blockKey={b.key}
            title={b.title}
            description={b.description}
            fields={b.fields}
            values={{ ...b.defaults, ...(map[b.key] ?? {}) }}
          />
        ))}
      </div>
    </div>
  );
}
