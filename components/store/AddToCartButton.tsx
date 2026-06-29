"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import type { Product } from "@/lib/types";

export default function AddToCartButton({
  product,
  className = "",
  label = "Add to Cart",
}: {
  product: Pick<Product, "id" | "slug" | "name" | "price_cents" | "image_url" | "stock_quantity">;
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
      unitPriceCents: product.price_cents,
      imageUrl: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  if (soldOut) {
    return (
      <button
        disabled
        className={`btn-primary w-full opacity-40 cursor-not-allowed ${className}`}
      >
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
