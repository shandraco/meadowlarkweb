"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createPaidPosOrder } from "@/lib/orders";
import { getSessionProfile, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPosLocationId, setPosLocation, clearPosLocation, touchPosSession } from "@/lib/pos-session";
import { writeAudit } from "@/lib/audit";
import { findProductByBarcode } from "@/lib/products";
import type { Product } from "@/lib/types";
import { ChooseLocationInput, PosOrderInput, firstIssue, uuid } from "@/lib/validation";

export interface PosSaleResult {
  ok: boolean;
  orderNumber?: number;
  totalCents?: number;
  error?: string;
}

export async function createPosOrder(input: unknown): Promise<PosSaleResult> {
  const session = await getSessionProfile();
  if (!session) return { ok: false, error: "Not signed in." };

  const parsed = PosOrderInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const p = parsed.data;

  const locationId = await getPosLocationId();
  if (!locationId) return { ok: false, error: "Pick a register location before ringing up sales." };

  try {
    const order = await createPaidPosOrder({
      channel: "pos",
      items: p.items,
      customer: p.customerName ? { name: p.customerName } : undefined,
      createdBy: session.userId,
      locationId,
      notes: "In-person sale",
    });
    await writeAudit({
      action: "create",
      entityType: "order",
      entityId: order.id,
      summary: `POS sale #${order.orderNumber} — ${p.items.length} items — $${(order.totalCents / 100).toFixed(2)}`,
      after: { orderNumber: order.orderNumber, channel: "pos", locationId, cashier: session.userId },
    });
    await touchPosSession();
    return { ok: true, orderNumber: order.orderNumber, totalCents: order.totalCents };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Sale failed." };
  }
}

// ── Barcode lookup (POS scanner) ───────────────────────────────────────────
const BarcodeInput = z.object({ barcode: z.string().min(1).max(120) }).strict();

export async function findProductByBarcodeAction(
  input: unknown,
): Promise<{ ok: boolean; product?: Product; error?: string }> {
  const session = await getSessionProfile();
  if (!session) return { ok: false, error: "Not signed in." };
  const parsed = BarcodeInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const product = await findProductByBarcode(parsed.data.barcode);
  if (!product) return { ok: false, error: "Barcode not on file." };
  return { ok: true, product };
}

export async function chooseLocation(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const session = await getSessionProfile();
  if (!session) return { ok: false, error: "Not signed in." };
  const parsed = ChooseLocationInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid location." };
  await setPosLocation(parsed.data);
  await writeAudit({
    action: "sign_in",
    entityType: "pos_session",
    entityId: session.userId,
    summary: `Cashier picked location ${parsed.data}`,
    after: { locationId: parsed.data },
  });
  revalidatePath("/pos");
  return { ok: true };
}

// Bound to a <form action={...}> so it must accept FormData and return void.
export async function switchLocation(_formData: FormData): Promise<void> {
  const session = await getSessionProfile();
  await clearPosLocation();
  if (session) {
    await writeAudit({
      action: "sign_out",
      entityType: "pos_session",
      entityId: session.userId,
      summary: "Cashier switched location",
    });
  }
  revalidatePath("/pos");
}

/* ── POS layout editing (admin only) ─────────────────────────────────────── */

const OrderedIdsInput = z
  .object({
    categoryId: uuid.nullable(),
    orderedIds: z.array(uuid).max(500),
  })
  .strict();

const OrderedCatIdsInput = z.object({ orderedIds: z.array(uuid).max(200) }).strict();

const MoveProductInput = z
  .object({ productId: uuid, categoryId: uuid.nullable() })
  .strict();

const CategoryNameInput = z
  .object({ name: z.string().transform((s) => s.trim()).pipe(z.string().min(1).max(60)) })
  .strict();

const CategoryRenameInput = z
  .object({ id: uuid, name: z.string().transform((s) => s.trim()).pipe(z.string().min(1).max(60)) })
  .strict();

const CategoryIdInput = z.object({ id: uuid }).strict();

export interface LayoutResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function reorderPosProducts(input: unknown): Promise<LayoutResult> {
  await requireAdmin();
  const parsed = OrderedIdsInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { categoryId, orderedIds } = parsed.data;

  const supabase = await createClient();
  const results = await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from("products").update({ pos_order: i, pos_category_id: categoryId }).eq("id", id),
    ),
  );
  const err = results.find((r) => r.error)?.error;
  if (err) return { ok: false, error: err.message };
  await writeAudit({
    action: "update",
    entityType: "pos_layout",
    summary: `Reordered ${orderedIds.length} products in category ${categoryId ?? "uncategorized"}`,
  });
  revalidatePath("/pos");
  return { ok: true };
}

export async function moveProductToCategory(input: unknown): Promise<LayoutResult> {
  await requireAdmin();
  const parsed = MoveProductInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { productId, categoryId } = parsed.data;

  const supabase = await createClient();
  let q = supabase.from("products").select("pos_order").order("pos_order", { ascending: false }).limit(1);
  q = categoryId === null ? q.is("pos_category_id", null) : q.eq("pos_category_id", categoryId);
  const { data } = await q;
  const nextOrder = (data?.[0]?.pos_order ?? -1) + 1;

  const { error } = await supabase
    .from("products")
    .update({ pos_category_id: categoryId, pos_order: nextOrder })
    .eq("id", productId);
  if (error) return { ok: false, error: error.message };
  await writeAudit({
    action: "update",
    entityType: "product",
    entityId: productId,
    summary: `Moved product to category ${categoryId ?? "uncategorized"}`,
  });
  revalidatePath("/pos");
  return { ok: true };
}

export async function createPosCategory(input: unknown): Promise<LayoutResult> {
  await requireAdmin();
  const parsed = CategoryNameInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { name } = parsed.data;

  const supabase = await createClient();
  const { data: max } = await supabase
    .from("pos_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort = (max?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("pos_categories")
    .insert({ name, sort_order: sort })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  await writeAudit({
    action: "create",
    entityType: "pos_category",
    entityId: data.id,
    summary: `Created POS category "${name}"`,
    after: { name, sort_order: sort },
  });
  revalidatePath("/pos");
  return { ok: true, id: data.id };
}

export async function renamePosCategory(input: unknown): Promise<LayoutResult> {
  await requireAdmin();
  const parsed = CategoryRenameInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id, name } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("pos_categories").select("name").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "Category not found." };

  const { error } = await supabase.from("pos_categories").update({ name }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await writeAudit({
    action: "update",
    entityType: "pos_category",
    entityId: id,
    summary: `Renamed POS category "${before.name}" → "${name}"`,
    before: { name: before.name },
    after: { name },
  });
  revalidatePath("/pos");
  return { ok: true };
}

export async function reorderPosCategories(input: unknown): Promise<LayoutResult> {
  await requireAdmin();
  const parsed = OrderedCatIdsInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { orderedIds } = parsed.data;

  const supabase = await createClient();
  const results = await Promise.all(
    orderedIds.map((id, i) => supabase.from("pos_categories").update({ sort_order: i }).eq("id", id)),
  );
  const err = results.find((r) => r.error)?.error;
  if (err) return { ok: false, error: err.message };
  await writeAudit({
    action: "update",
    entityType: "pos_layout",
    summary: `Reordered ${orderedIds.length} POS categories`,
  });
  revalidatePath("/pos");
  return { ok: true };
}

export async function deletePosCategory(input: unknown): Promise<LayoutResult> {
  await requireAdmin();
  const parsed = CategoryIdInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("pos_categories").select("name").eq("id", id).maybeSingle();

  const { error } = await supabase.from("pos_categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await writeAudit({
    action: "delete",
    entityType: "pos_category",
    entityId: id,
    summary: `Deleted POS category "${before?.name ?? id}"`,
    before,
  });
  revalidatePath("/pos");
  return { ok: true };
}
