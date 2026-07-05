"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveFarmVideos, type VideosPayload } from "@/app/admin/videos/actions";

export default function FarmVideosEditor({ initial }: { initial: VideosPayload }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState<VideosPayload>(initial);

  function setVideo(i: number, key: "title" | "url" | "posterUrl", v: string) {
    setF((p) => ({
      ...p,
      videos: p.videos.map((row, idx) => (idx === i ? { ...row, [key]: v } : row)),
    }));
  }
  function addSlot() {
    setF((p) => ({ ...p, videos: [...p.videos, { title: "", url: "", posterUrl: "" }] }));
  }
  function removeSlot(i: number) {
    setF((p) => ({ ...p, videos: p.videos.filter((_, idx) => idx !== i) }));
  }

  function save() {
    setError(null);
    start(async () => {
      const res = await saveFarmVideos(f);
      if (!res.ok) return setError(res.error ?? "Save failed.");
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      router.refresh();
    });
  }

  const input =
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow";
  const label = "block text-xs tracking-widest uppercase font-light text-stone mb-2";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className={label}>Eyebrow</label>
          <input className={input} value={f.eyebrow} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} />
        </div>
        <div>
          <label className={label}>Headline</label>
          <input className={input} value={f.headline} onChange={(e) => setF({ ...f, headline: e.target.value })} />
        </div>
        <div>
          <label className={label}>Emphasis (italic)</label>
          <input className={input} value={f.emphasis} onChange={(e) => setF({ ...f, emphasis: e.target.value })} />
        </div>
      </div>

      <div>
        <p className="section-label mb-3">Videos</p>
        <div className="space-y-4">
          {f.videos.map((v, i) => (
            <div key={i} className="border border-meadow/10 bg-paper-dark/30 p-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={label}>Title</label>
                  <input className={input} value={v.title} onChange={(e) => setVideo(i, "title", e.target.value)} placeholder="Pressing" />
                </div>
                <div>
                  <label className={label}>Poster image URL (optional)</label>
                  <input className={input} value={v.posterUrl ?? ""} onChange={(e) => setVideo(i, "posterUrl", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={label}>Video URL (MP4)</label>
                <input className={input} value={v.url} onChange={(e) => setVideo(i, "url", e.target.value)} placeholder="https://…/pressing.mp4" />
              </div>
              <button
                type="button"
                onClick={() => removeSlot(i)}
                className="text-xs tracking-widest uppercase text-stone hover:text-sunset"
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addSlot} className="text-xs tracking-widest uppercase text-meadow hover:text-meadow-deep">
            + Add another video
          </button>
        </div>
        <p className="text-xs text-ink-soft/60 font-light mt-3">
          Keep clips under 10 seconds. No faces of children — hands and processes only.
        </p>
      </div>

      {error && <p className="text-sm text-sunset font-light">{error}</p>}

      <button onClick={save} disabled={pending} className="btn-primary disabled:opacity-50">
        {pending ? "Saving…" : saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}
