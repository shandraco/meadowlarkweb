"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import type { Product } from "@/lib/types";
import { effectivePriceCents } from "@/lib/types";

export default function AddToCartButton({
  product,
  className = "",
  label = "Add to Cart",
}: {
  product: Pick<
    Product,
    | "id"
    | "slug"
    | "name"
    | "price_cents"
    | "sale_price_cents"
    | "sale_starts_at"
    | "sale_ends_at"
    | "image_url"
    | "stock_quantity"
    | "requires_age_check"
  >;
  className?: string;
  label?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock_quantity <= 0;

  function handleAdd() {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      unitPriceCents: effectivePriceCents(product),
      imageUrl: product.image_url,
      requiresAgeCheck: product.requires_age_check,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  if (soldOut) {
    return (
      <button disabled className={`btn-primary w-full opacity-40 cursor-not-allowed ${className}`}>
        Sold Out
      </button>
    );
  }

  return (
    <button onClick={handleAdd} className={`btn-primary w-full ${className}`}>
      {added ? "Added ✓" : label}
    </button>
  );
}
