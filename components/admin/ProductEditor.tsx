"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product, Vendor } from "@/lib/types";
import { createProduct, updateProductContent } from "@/app/admin/products/actions";
import ImageUpload from "./ImageUpload";

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDateInput(v: string): string | null {
  return v ? new Date(v).toISOString() : null;
}

export default function ProductEditor({ product, vendors }: { product?: Product; vendors: Vendor[] }) {
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
    salePrice: product?.sale_price_cents ? (product.sale_price_cents / 100).toFixed(2) : "",
    saleStartsAt: toDateInput(product?.sale_starts_at ?? null),
    saleEndsAt: toDateInput(product?.sale_ends_at ?? null),
    abv: product?.abv ?? "",
    description: product?.description ?? "",
    imageUrl: product?.image_url ?? "",
    sortOrder: String(product?.sort_order ?? 50),
    initialStock: "0",
    vendorId: product?.vendor_id ?? "",
    requiresAgeCheck: product?.requires_age_check ?? true,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const salePrice = f.salePrice.trim() ? Math.round(parseFloat(f.salePrice) * 100) : null;
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
      vendorId: f.vendorId || null,
      requiresAgeCheck: f.requiresAgeCheck,
      salePriceCents: salePrice,
      saleStartsAt: fromDateInput(f.saleStartsAt),
      saleEndsAt: fromDateInput(f.saleEndsAt),
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
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow transition-colors";

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div>
        <label className={label}>Name</label>
        <input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} required />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>Category</label>
          <select
            className={input}
            value={f.category}
            onChange={(e) => set("category", e.target.value as "cider" | "farm-good")}
          >
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
          <input
            className={input}
            inputMode="numeric"
            value={f.sortOrder}
            onChange={(e) => set("sortOrder", e.target.value)}
          />
        </div>
      </div>

      <div className="border border-meadow/15 bg-paper-dark/40 p-5 space-y-4">
        <p className="section-label">Sale pricing (optional)</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={label}>Sale price</label>
            <input
              className={input}
              inputMode="decimal"
              value={f.salePrice}
              onChange={(e) => set("salePrice", e.target.value)}
              placeholder="9.99"
            />
          </div>
          <div>
            <label className={label}>Sale starts</label>
            <input
              className={input}
              type="datetime-local"
              value={f.saleStartsAt}
              onChange={(e) => set("saleStartsAt", e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Sale ends</label>
            <input
              className={input}
              type="datetime-local"
              value={f.saleEndsAt}
              onChange={(e) => set("saleEndsAt", e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-ink-soft/60 font-light">
          Leave the sale price blank to disable. Prices and dates ripple everywhere: store, POS, connected shippers.
        </p>
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea className={input} rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div>
        <label className={label}>Image</label>
        <ImageUpload value={f.imageUrl} onChange={(url) => set("imageUrl", url)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>Vendor (consignment)</label>
          <select className={input} value={f.vendorId} onChange={(e) => set("vendorId", e.target.value)}>
            <option value="">— Owned by the farm —</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} · {v.split_pct}%
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-ink font-light">
            <input
              type="checkbox"
              className="w-4 h-4 accent-meadow"
              checked={f.requiresAgeCheck}
              onChange={(e) => set("requiresAgeCheck", e.target.checked)}
            />
            Requires 21+ age check at checkout
          </label>
        </div>
      </div>

      <div>
        <label className={label}>Slug {editing ? "" : "(optional — auto from name)"}</label>
        <input className={input} value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="meadowlark-red" />
      </div>

      {!editing && (
        <div className="max-w-[200px]">
          <label className={label}>Opening stock</label>
          <input
            className={input}
            inputMode="numeric"
            value={f.initialStock}
            onChange={(e) => set("initialStock", e.target.value)}
          />
        </div>
      )}

      {error && <p className="text-sm text-sunset font-light">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? "Saving…" : saved ? "Saved ✓" : editing ? "Save changes" : "Create product"}
        </button>
        <Link
          href="/admin/products"
          className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
