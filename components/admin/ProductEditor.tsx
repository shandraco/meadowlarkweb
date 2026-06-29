"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { createProduct, updateProductContent } from "@/app/admin/products/actions";
import ImageUpload from "./ImageUpload";

export default function ProductEditor({ product }: { product?: Product }) {
  const router = useRouter();
  const editing = !!product;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category: (product?.category ?? "cider") as "cider" | "farm-good",
    tier: product?.tier ?? "",
    price: product ? (product.price_cents / 100).toFixed(2) : "",
    abv: product?.abv ?? "",
    description: product?.description ?? "",
    imageUrl: product?.image_url ?? "",
    sortOrder: String(product?.sort_order ?? 50),
    initialStock: "0",
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const base = {
      name: f.name,
      slug: f.slug,
      tier: f.tier,
      category: f.category,
      description: f.description,
      priceCents: Math.round(parseFloat(f.price || "0") * 100),
      abv: f.abv,
      imageUrl: f.imageUrl,
      sortOrder: parseInt(f.sortOrder, 10) || 50,
    };
    start(async () => {
      const res = editing
        ? await updateProductContent({ ...base, id: product!.id })
        : await createProduct({ ...base, initialStock: parseInt(f.initialStock, 10) || 0 });
      if (!res.ok) {
        setError(res.error ?? "Save failed.");
        return;
      }
      if (editing) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
        router.refresh();
      } else {
        router.push("/admin/products");
      }
    });
  }

  const label = "block text-xs tracking-widest uppercase font-light text-stone mb-2";
  const input =
    "w-full border border-orchard/20 bg-cream text-orchard placeholder:text-stone/40 px-3 py-2.5 text-sm font-light outline-none focus:border-orchard transition-colors";

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div>
        <label className={label}>Name</label>
        <input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} required />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>Category</label>
          <select className={input} value={f.category} onChange={(e) => set("category", e.target.value)}>
            <option value="cider">Cider</option>
            <option value="farm-good">Farm Good</option>
          </select>
        </div>
        <div>
          <label className={label}>Tier / Section</label>
          <input className={input} value={f.tier} onChange={(e) => set("tier", e.target.value)} placeholder="Flagship, Reserve, Farm Store…" />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className={label}>Price (USD)</label>
          <input className={input} inputMode="decimal" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="14.00" required />
        </div>
        <div>
          <label className={label}>ABV (optional)</label>
          <input className={input} value={f.abv} onChange={(e) => set("abv", e.target.value)} placeholder="5% ABV" />
        </div>
        <div>
          <label className={label}>Sort order</label>
          <input className={input} inputMode="numeric" value={f.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
        </div>
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea className={input} rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div>
        <label className={label}>Image</label>
        <ImageUpload value={f.imageUrl} onChange={(url) => set("imageUrl", url)} />
      </div>

      <div>
        <label className={label}>Slug {editing ? "" : "(optional — auto from name)"}</label>
        <input className={input} value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="meadowlark-red" />
      </div>

      {!editing && (
        <div className="max-w-[200px]">
          <label className={label}>Opening stock</label>
          <input className={input} inputMode="numeric" value={f.initialStock} onChange={(e) => set("initialStock", e.target.value)} />
        </div>
      )}

      {error && <p className="text-sm text-maroon font-light">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? "Saving…" : saved ? "Saved ✓" : editing ? "Save changes" : "Create product"}
        </button>
        <Link href="/admin/products" className="text-xs tracking-widest uppercase font-light text-stone hover:text-orchard transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
