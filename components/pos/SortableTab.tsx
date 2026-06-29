"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PosCategory } from "@/lib/types";

// A category tab in edit mode: draggable, inline-renamable, deletable.
export default function SortableTab({
  cat,
  active,
  onActivate,
  onNameChange,
  onNameCommit,
  onDelete,
}: {
  cat: PosCategory;
  active: boolean;
  onActivate: (id: string) => void;
  onNameChange: (id: string, name: string) => void;
  onNameCommit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cat.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onActivate(cat.id)}
      className={`flex items-center gap-1.5 px-2.5 py-2 border whitespace-nowrap shrink-0 ${
        active ? "border-orchard bg-orchard/10" : "border-orchard/20 bg-cream"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-stone/50 touch-none"
        aria-label="Drag to reorder category"
      >
        ⠿
      </button>
      <input
        value={cat.name}
        onChange={(e) => onNameChange(cat.id, e.target.value)}
        onBlur={() => onNameCommit(cat.id)}
        className="bg-transparent text-sm text-orchard w-24 outline-none"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(cat.id);
        }}
        className="text-stone/50 hover:text-maroon text-sm"
        aria-label="Delete category"
      >
        ×
      </button>
    </div>
  );
}
