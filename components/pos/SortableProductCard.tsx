"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Product, PosCategory } from "@/lib/types";
import { formatUSD } from "@/lib/money";

export const UNCAT = "__uncat__";

// A product card shown only in edit mode: draggable (handle) + a category
// dropdown to move it to another tab.
export default function SortableProductCard({
  product,
  categories,
  onMove,
}: {
  product: Product;
  categories: PosCategory[];
  onMove: (productId: string, categoryId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-3 border border-orchard/25 bg-cream">
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-stone/50 text-lg leading-none touch-none -mt-0.5"
          aria-label="Drag to reorder"
        >
          ⠿
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-base text-orchard leading-tight">{product.name}</p>
          <p className="font-serif text-sm text-stone">{formatUSD(product.price_cents)}</p>
        </div>
      </div>
      <select
        value={product.pos_category_id ?? UNCAT}
        onChange={(e) => onMove(product.id, e.target.value)}
        className="w-full mt-2 border border-orchard/15 bg-cream-dark/40 text-orchard text-xs px-2 py-1.5 outline-none focus:border-orchard"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
        <option value={UNCAT}>Uncategorized</option>
      </select>
    </div>
  );
}
