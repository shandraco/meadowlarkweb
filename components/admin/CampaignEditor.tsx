"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CampaignStatus, DiscountCampaign, Product } from "@/lib/types";
import { upsertCampaign, markSocialPosted } from "@/app/admin/campaigns/actions";
import { formatUSD } from "@/lib/money";

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 16);
}

function fromDateInput(v: string): string | null {
  return v ? new Date(v).toISOString() : null;
}

export default function CampaignEditor({
  campaign,
  products,
}: {
  campaign?: DiscountCampaign;
  products: Product[];
}) {
  const router = useRouter();
  const editing = !!campaign;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState({
    name: campaign?.name ?? "",
    status: (campaign?.status ?? "draft") as CampaignStatus,
    productIds: campaign?.product_ids ?? [],
    startsAt: toDateInput(campaign?.starts_at ?? null),
    endsAt: toDateInput(campaign?.ends_at ?? null),
    heroImageUrl: campaign?.hero_image_url ?? "",
    headline: campaign?.headline ?? "",
    body: campaign?.body ?? "",
    socialRef: "",
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  function toggleProduct(id: string) {
    setF((p) => ({
      ...p,
      productIds: p.productIds.includes(id) ? p.productIds.filter((x) => x !== id) : [...p.productIds, id],
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await upsertCampaign({
        id: campaign?.id ?? null,
        name: f.name,
        status: f.status,
        productIds: f.productIds,
        startsAt: fromDateInput(f.startsAt),
        endsAt: fromDateInput(f.endsAt),
        heroImageUrl: f.heroImageUrl,
        headline: f.headline,
        body: f.body,
      });
      if (!res.ok) return setError(res.error ?? "Save failed.");
      if (editing) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
        router.refresh();
      } else router.push("/admin/campaigns");
    });
  }

  const input =
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow transition-colors";
  const label = "block text-xs tracking-widest uppercase font-light text-stone mb-2";

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div>
        <label className={label}>Campaign name</label>
        <input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} required />
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className={label}>Status</label>
          <select className={input} value={f.status} onChange={(e) => set("status", e.target.value as CampaignStatus)}>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
          </select>
        </div>
        <div>
          <label className={label}>Starts</label>
          <input className={input} type="datetime-local" value={f.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
        </div>
        <div>
          <label className={label}>Ends</label>
          <input className={input} type="datetime-local" value={f.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>Hero image URL</label>
          <input className={input} value={f.heroImageUrl} onChange={(e) => set("heroImageUrl", e.target.value)} />
        </div>
        <div>
          <label className={label}>Headline</label>
          <input className={input} value={f.headline} onChange={(e) => set("headline", e.target.value)} placeholder="Peach cider — $3 off this weekend" />
        </div>
      </div>

      <div>
        <label className={label}>Body (used on social + email)</label>
        <textarea className={input} rows={3} value={f.body} onChange={(e) => set("body", e.target.value)} />
      </div>

      <div>
        <p className="section-label mb-3">Products included</p>
        <div className="grid sm:grid-cols-2 gap-2 max-h-64 overflow-auto border border-meadow/10 p-3 bg-paper-dark/30">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm text-ink font-light">
              <input
                type="checkbox"
                checked={f.productIds.includes(p.id)}
                onChange={() => toggleProduct(p.id)}
                className="w-4 h-4 accent-meadow"
              />
              <span className="flex-1">{p.name}</span>
              <span className="text-xs text-ink-soft">{formatUSD(p.price_cents)}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-sunset font-light">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? "Saving…" : saved ? "Saved ✓" : editing ? "Save changes" : "Create campaign"}
        </button>
      </div>

      {editing && (
        <div className="border-t border-meadow/10 pt-6 space-y-3">
          <p className="section-label">Social auto-post</p>
          {campaign!.social_posted_at ? (
            <p className="text-sm text-meadow font-light">
              Posted {new Date(campaign!.social_posted_at).toLocaleString()}
              {campaign!.social_post_ref && ` · ref ${campaign!.social_post_ref}`}
            </p>
          ) : (
            <div className="flex gap-2 items-center">
              <input
                className={input}
                value={f.socialRef}
                onChange={(e) => set("socialRef", e.target.value)}
                placeholder="Optional: Meta post URL or ID once posted"
              />
              <button
                type="button"
                onClick={() =>
                  start(async () => {
                    await markSocialPosted({ id: campaign!.id, ref: f.socialRef });
                    router.refresh();
                  })
                }
                className="btn-outline whitespace-nowrap"
              >
                Mark posted
              </button>
            </div>
          )}
          <p className="text-xs text-ink-soft/60 font-light">
            When the Meta Graph API is wired in, going live triggers the post automatically.
          </p>
        </div>
      )}
    </form>
  );
}
