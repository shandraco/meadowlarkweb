"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/product-images";

interface Props {
  images: ProductImage[];
  fallback: {
    url: string | null;
    alt: string;
  };
}

// Simple thumbnail-navigated gallery. First render uses the "primary" image
// (or the legacy products.image_url as a fallback for products that haven't
// been migrated to multi-image). Clicking a thumb swaps the main view.
export default function ProductGallery({ images, fallback }: Props) {
  const displayImages =
    images.length > 0
      ? images
      : fallback.url
        ? [
            {
              id: "fallback",
              product_id: "",
              url: fallback.url,
              alt_text: fallback.alt,
              is_primary: true,
              sort_order: 0,
              created_at: "",
            } as ProductImage,
          ]
        : [];

  const [activeIdx, setActiveIdx] = useState(0);
  const active = displayImages[activeIdx];

  if (!active) {
    return (
      <div className="aspect-[4/5] bg-wheat-dark border border-meadow/10 flex items-center justify-center">
        <p className="text-ink-soft/60 font-light">No photo yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-[4/5] relative overflow-hidden bg-wheat-dark">
        <Image
          key={active.id}
          src={active.url}
          alt={active.alt_text ?? fallback.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className="estate-photo object-cover"
        />
      </div>
      {displayImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2 mt-3">
          {displayImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(i)}
              className={`relative aspect-square border-2 overflow-hidden transition-colors ${
                i === activeIdx ? "border-cider" : "border-transparent hover:border-meadow/40"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt_text ?? ""} className="w-full h-full object-cover estate-photo" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
