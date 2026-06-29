"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Product, PosCategory } from "@/lib/types";
import { formatUSD } from "@/lib/money";
import {
  reorderPosProducts,
  reorderPosCategories,
  moveProductToCategory,
  createPosCategory,
  renamePosCategory,
  deletePosCategory,
} from "@/app/pos/actions";
import SortableProductCard, { UNCAT } from "./SortableProductCard";
import SortableTab from "./SortableTab";

export default function PosCatalog({
  products,
  categories,
  canEdit,
  onAdd,
}: {
  products: Product[];
  categories: PosCategory[];
  canEdit: boolean;
  onAdd: (p: Product) => void;
}) {
  const [cats, setCats] = useState<PosCategory[]>(categories);
  const [items, setItems] = useState<Product[]>(products);
  const [edit, setEdit] = useState(false);

  const hasUncat = items.some((p) => !p.pos_category_id);
  const tabIds = useMemo(() => {
    const ids = cats.map((c) => c.id);
    if (hasUncat || edit) ids.push(UNCAT);
    return ids;
  }, [cats, hasUncat, edit]);

  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? UNCAT);
  const active = tabIds.includes(activeId) ? activeId : tabIds[0] ?? UNCAT;

  const activeItems = useMemo(() => {
    const list = items.filter((p) =>
      active === UNCAT ? !p.pos_category_id : p.pos_category_id === active,
    );
    return list.sort((a, b) => a.pos_order - b.pos_order);
  }, [items, active]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  );

  function tabName(id: string) {
    return id === UNCAT ? "Uncategorized" : cats.find((c) => c.id === id)?.name ?? "";
  }

  // ── drag handlers ──
  function onProductDragEnd(e: DragEndEvent) {
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;
    const ids = activeItems.map((p) => p.id);
    const newIds = arrayMove(ids, ids.indexOf(a.id as string), ids.indexOf(over.id as string));
    setItems((prev) =>
      prev.map((p) => {
        const idx = newIds.indexOf(p.id);
        return idx === -1 ? p : { ...p, pos_order: idx };
      }),
    );
    reorderPosProducts(active === UNCAT ? null : active, newIds);
  }

  function onTabDragEnd(e: DragEndEvent) {
    const { active: a, over } = e;
    if (!over || a.id === over.id || a.id === UNCAT || over.id === UNCAT) return;
    const ids = cats.map((c) => c.id);
    const reordered = arrayMove(cats, ids.indexOf(a.id as string), ids.indexOf(over.id as string));
    setCats(reordered.map((c, i) => ({ ...c, sort_order: i })));
    reorderPosCategories(reordered.map((c) => c.id));
  }

  // ── category ops ──
  async function addCategory() {
    const res = await createPosCategory("New Category");
    if (res.ok && res.id) {
      setCats((c) => [...c, { id: res.id!, name: "New Category", sort_order: c.length, created_at: "" }]);
      setActiveId(res.id);
    }
  }
  function changeName(id: string, name: string) {
    setCats((c) => c.map((x) => (x.id === id ? { ...x, name } : x)));
  }
  function commitName(id: string) {
    const name = cats.find((c) => c.id === id)?.name ?? "";
    if (name.trim()) renamePosCategory(id, name);
  }
  function removeCategory(id: string) {
    setItems((p) => p.map((x) => (x.pos_category_id === id ? { ...x, pos_category_id: null } : x)));
    setCats((c) => c.filter((x) => x.id !== id));
    if (active === id) setActiveId(UNCAT);
    deletePosCategory(id);
  }
  function moveItem(productId: string, categoryId: string) {
    const cat = categoryId === UNCAT ? null : categoryId;
    setItems((p) => p.map((x) => (x.id === productId ? { ...x, pos_category_id: cat } : x)));
    moveProductToCategory(productId, cat);
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Tab bar + edit toggle */}
      <div className="flex items-center gap-2 border-b border-orchard/15 px-3 py-2 shrink-0">
        <div className="flex-1 flex gap-2 overflow-x-auto">
          {edit ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onTabDragEnd}>
              <SortableContext items={cats.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
                {cats.map((c) => (
                  <SortableTab
                    key={c.id}
                    cat={c}
                    active={active === c.id}
                    onActivate={setActiveId}
                    onNameChange={changeName}
                    onNameCommit={commitName}
                    onDelete={removeCategory}
                  />
                ))}
              </SortableContext>
              {hasUncat && (
                <button
                  onClick={() => setActiveId(UNCAT)}
                  className={`px-3 py-2 text-sm whitespace-nowrap shrink-0 border ${active === UNCAT ? "border-orchard bg-orchard/10" : "border-orchard/20"}`}
                >
                  Uncategorized
                </button>
              )}
              <button onClick={addCategory} className="px-3 py-2 text-sm whitespace-nowrap shrink-0 border border-dashed border-orchard/40 text-orchard">
                + Category
              </button>
            </DndContext>
          ) : (
            tabIds.map((id) => (
              <button
                key={id}
                onClick={() => setActiveId(id)}
                className={`px-3.5 py-2 text-sm whitespace-nowrap shrink-0 transition-colors ${
                  active === id ? "bg-orchard text-cream" : "text-orchard hover:bg-cream-dark/50"
                }`}
              >
                {tabName(id)}
              </button>
            ))
          )}
        </div>

        {canEdit && (
          <button
            onClick={() => setEdit((e) => !e)}
            className={`text-xs tracking-widest uppercase px-3 py-2 shrink-0 transition-colors ${
              edit ? "bg-maroon text-cream" : "border border-orchard/30 text-orchard hover:bg-orchard hover:text-cream"
            }`}
          >
            {edit ? "Done" : "Edit layout"}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {edit ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onProductDragEnd}>
            <SortableContext items={activeItems.map((p) => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {activeItems.map((p) => (
                  <SortableProductCard key={p.id} product={p} categories={cats} onMove={moveItem} />
                ))}
              </div>
            </SortableContext>
            {activeItems.length === 0 && (
              <p className="text-stone/50 font-light text-sm py-10 text-center">
                No products here. Move some in with the dropdown, or pick another tab.
              </p>
            )}
          </DndContext>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {activeItems.map((p) => {
              const out = p.stock_quantity <= 0;
              return (
                <button
                  key={p.id}
                  onClick={() => onAdd(p)}
                  disabled={out}
                  className={`text-left p-4 border transition-colors min-h-[96px] flex flex-col justify-between ${
                    out
                      ? "border-orchard/10 opacity-40 cursor-not-allowed"
                      : "border-orchard/15 bg-cream hover:border-orchard hover:bg-cream-dark/40 active:bg-orchard active:text-cream"
                  }`}
                >
                  <span className="font-serif text-lg leading-tight">{p.name}</span>
                  <span className="flex items-center justify-between mt-2">
                    <span className="font-serif text-base">{formatUSD(p.price_cents)}</span>
                    <span className="text-[10px] tracking-widest uppercase text-stone">{p.stock_quantity} in stock</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
