"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContentField } from "@/lib/content-types";
import { saveContent } from "@/app/admin/content/actions";

export default function ContentEditor({
  blockKey,
  title,
  description,
  fields,
  values,
}: {
  blockKey: string;
  title: string;
  description: string;
  fields: ContentField[];
  values: Record<string, string>;
}) {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>(values);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    start(async () => {
      const res = await saveContent(blockKey, v);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
        router.refresh();
      } else {
        setError(res.error ?? "Save failed.");
      }
    });
  }

  const input =
    "w-full border border-orchard/20 bg-cream text-orchard placeholder:text-stone/40 px-3 py-2.5 text-sm font-light outline-none focus:border-orchard transition-colors";

  return (
    <div className="border border-orchard/10 p-6 md:p-8 mb-8">
      <h2 className="font-serif text-2xl text-orchard">{title}</h2>
      <p className="text-stone font-light text-sm mb-6">{description}</p>

      <div className="grid sm:grid-cols-2 gap-5">
        {fields.map((f) => (
          <div key={f.key} className={f.multiline ? "sm:col-span-2" : ""}>
            <label className="block text-xs tracking-widest uppercase font-light text-stone mb-2">{f.label}</label>
            {f.multiline ? (
              <textarea
                className={input}
                rows={3}
                value={v[f.key] ?? ""}
                onChange={(e) => setV((p) => ({ ...p, [f.key]: e.target.value }))}
              />
            ) : (
              <input
                className={input}
                value={v[f.key] ?? ""}
                onChange={(e) => setV((p) => ({ ...p, [f.key]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-maroon font-light mt-4">{error}</p>}

      <div className="mt-6">
        <button onClick={save} disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
      </div>
    </div>
  );
}
