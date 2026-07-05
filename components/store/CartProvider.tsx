"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";
import { cartSubtotalCents } from "@/lib/money";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  hydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "meadowlark-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount (avoids SSR/client mismatch). Backfill any legacy lines
  // that predate the requiresAgeCheck field so the checkout gate never gets
  // silently skipped for cider left in an old cart.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CartLine>[];
        const normalized: CartLine[] = parsed
          .filter((l): l is CartLine & { requiresAgeCheck?: boolean } =>
            typeof l.productId === "string" && typeof l.quantity === "number",
          )
          .map((l) => ({
            productId: l.productId,
            slug: l.slug ?? "",
            name: l.name ?? "",
            unitPriceCents: l.unitPriceCents ?? 0,
            quantity: l.quantity,
            imageUrl: l.imageUrl ?? null,
            requiresAgeCheck: l.requiresAgeCheck ?? true,
          }));
        setLines(normalized);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist on change (after hydration).
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    return {
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotalCents: cartSubtotalCents(lines),
      hydrated,
      add: (line, qty = 1) =>
        setLines((prev) => {
          const i = prev.findIndex((l) => l.productId === line.productId);
          if (i === -1) return [...prev, { ...line, quantity: qty }];
          const next = [...prev];
          next[i] = { ...next[i], quantity: next[i].quantity + qty };
          return next;
        }),
      setQty: (productId, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.productId !== productId)
            : prev.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l)),
        ),
      remove: (productId) => setLines((prev) => prev.filter((l) => l.productId !== productId)),
      clear: () => setLines([]),
    };
  }, [lines, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
