"use server";

import { revalidatePath } from "next/cache";
import { createPaidOrder } from "@/lib/orders";
import { getSessionProfile, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface PosSaleResult {
  ok: boolean;
  orderNumber?: number;
  totalCents?: number;
  error?: string;
}

// Rings up an in-person sale. Same order pipeline as online checkout, tagged
// channel:'pos' and attributed to the signed-in cashier.
export async function createPosOrder(input: {
  items: { productId: string; quantity: number }[];
  customerName?: string;
}): Promise<PosSaleResult> {
  const session = await getSessionProfile();
  if (!session) return { ok: false, error: "Not signed in." };
  if (!input.items.length) return { ok: false, error: "Ticket is empty." };

  try {
    const order = await createPaidOrder({
      channel: "pos",
      items: input.items,
      customer: input.customerName?.trim() ? { name: input.customerName.trim() } : undefined,
      createdBy: session.userId,
      notes: "In-person sale",
    });
    return { ok: true, orderNumber: order.orderNumber, totalCents: order.totalCents };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Sale failed." };
  }
}

/* ── POS layout editing (admin only) ─────────────────────────────────────── */

export interface LayoutResult {
  ok: boolean;
  id?: string;
  error?: string;
}

// Persist the order of products within a category (drag-and-drop result).
export async function reorderPosProducts(
  categoryId: string | null,
  orderedIds: string[],
): Promise<LayoutResult> {
  await requireAdmin();
  const supabase = await createClient();
  const results = await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from("products").update({ pos_order: i, pos_category_id: categoryId }).eq("id", id),
    ),
  );
  const err = results.find((r) => r.error)?.error;
  if (err) return { ok: false, error: err.message };
  revalidatePath("/pos");
  return { ok: true };
}

export async function moveProductToCategory(
  productId: string,
  categoryId: string | null,
): Promise<LayoutResult> {
  await requireAdmin();
  const supabase = await createClient();

  // Append to the end of the target category.
  let q = supabase.from("products").select("pos_order").order("pos_order", { ascending: false }).limit(1);
  q = categoryId === null ? q.is("pos_category_id", null) : q.eq("pos_category_id", categoryId);
  const { data } = await q;
  const nextOrder = (data?.[0]?.pos_order ?? -1) + 1;

  const { error } = await supabase
    .from("products")
    .update({ pos_category_id: categoryId, pos_order: nextOrder })
    .eq("id", productId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/pos");
  return { ok: true };
}

export async function createPosCategory(name: string): Promise<LayoutResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: max } = await supabase
    .from("pos_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort = (max?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("pos_categories")
    .insert({ name: name.trim() || "New Category", sort_order: sort })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/pos");
  return { ok: true, id: data!.id as string };
}

export async function renamePosCategory(id: string, name: string): Promise<LayoutResult> {
  await requireAdmin();
  if (!name.trim()) return { ok: false, error: "Name required." };
  const supabase = await createClient();
  const { error } = await supabase.from("pos_categories").update({ name: name.trim() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/pos");
  return { ok: true };
}

export async function reorderPosCategories(orderedIds: string[]): Promise<LayoutResult> {
  await requireAdmin();
  const supabase = await createClient();
  const results = await Promise.all(
    orderedIds.map((id, i) => supabase.from("pos_categories").update({ sort_order: i }).eq("id", id)),
  );
  const err = results.find((r) => r.error)?.error;
  if (err) return { ok: false, error: err.message };
  revalidatePath("/pos");
  return { ok: true };
}

export async function deletePosCategory(id: string): Promise<LayoutResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("pos_categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/pos");
  return { ok: true };
}

