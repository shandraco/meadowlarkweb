"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ProductImage } from "@/lib/product-images";
import {
  addProductImage,
  removeProductImage,
  reorderProductImages,
  setPrimaryImage,
} from "@/app/admin/products/images/actions";

export default function ImageGalleryPanel({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImage[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [images, setImages] = useState(initialImages);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function add() {
    if (!url.trim()) return;
    setError(null);
    start(async () => {
      const res = await addProductImage({
        productId,
        url,
        altText: alt || undefined,
        isPrimary: images.length === 0,
      });
      if (!res.ok) return setError(res.error ?? "Failed.");
      setUrl("");
      setAlt("");
      router.refresh();
    });
  }

  function makePrimary(id: string) {
    start(async () => {
      await setPrimaryImage({ id, productId });
      setImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === id })));
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("Remove this image?")) return;
    start(async () => {
      await removeProductImage({ id });
      setImages((prev) => prev.filter((img) => img.id !== id));
      router.refresh();
    });
  }

  function move(id: string, direction: -1 | 1) {
    const idx = images.findIndex((i) => i.id === id);
    const swapIdx = idx + direction;
    if (idx < 0 || swapIdx < 0 || swapIdx >= images.length) return;
    const next = [...images];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setImages(next);
    start(async () => {
      await reorderProductImages({ productId, orderedIds: next.map((i) => i.id) });
      router.refresh();
    });
  }

  const input =
    "w-full border border-meadow/20 bg-wheat text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow";

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label mb-3">Gallery ({images.length})</p>
        {images.length === 0 ? (
          <p className="text-ink-soft/70 font-light text-sm border border-dashed border-meadow/20 p-4 text-center">
            No gallery images yet. Add URLs below — the first one becomes the primary shot on the store card.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div key={img.id} className="border border-meadow/15 bg-wheat overflow-hidden">
                <div className="relative aspect-square bg-wheat-dark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt_text ?? ""} className="w-full h-full object-cover" />
                  {img.is_primary && (
                    <span className="absolute top-2 left-2 text-[10px] tracking-widest uppercase bg-sunflower text-ink px-2 py-1">
                      Primary
                    </span>
                  )}
                </div>
                <div className="p-2 flex flex-wrap gap-1 text-[10px] tracking-widest uppercase">
                  {!img.is_primary && (
                    <button
                      onClick={() => makePrimary(img.id)}
                      disabled={pending}
                      className="text-meadow hover:text-meadow-deep px-1"
                    >
                      Make primary
                    </button>
                  )}
                  <button onClick={() => move(img.id, -1)} disabled={pending || i === 0} className="text-stone disabled:opacity-30 px-1">
                    ↑
                  </button>
                  <button
                    onClick={() => move(img.id, 1)}
                    disabled={pending || i === images.length - 1}
                    className="text-stone disabled:opacity-30 px-1"
                  >
                    ↓
                  </button>
                  <button onClick={() => remove(img.id)} disabled={pending} className="text-cider hover:text-cider-deep px-1 ml-auto">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="section-label mb-3">Add another image</p>
        <div className="space-y-2">
          <input className={input} placeholder="https://…/photo.jpg" value={url} onChange={(e) => setUrl(e.target.value)} />
          <input className={input} placeholder="Alt text (optional)" value={alt} onChange={(e) => setAlt(e.target.value)} />
          {error && <p className="text-sm text-cider font-light">{error}</p>}
          <button onClick={add} disabled={pending || !url.trim()} className="btn-primary w-full disabled:opacity-50">
            Add to gallery
          </button>
        </div>
        <p className="text-xs text-ink-soft/70 font-light mt-3">
          Use the Products &amp; Stock uploader on the main tab to host new photos on Supabase Storage, then paste the URL here.
        </p>
      </div>
    </div>
  );
}
