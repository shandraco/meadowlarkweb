"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/audit";
import {
  AddProductImageInput,
  RemoveImageInput,
  ReorderImagesInput,
  SetPrimaryImageInput,
  firstIssue,
} from "@/lib/validation";

export interface ImageResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function refresh(productId: string) {
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/store");
  revalidatePath(`/store`);
}

export async function addProductImage(input: unknown): Promise<ImageResult> {
  await requireAdmin();
  const parsed = AddProductImageInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const p = parsed.data;

  const supabase = await createClient();

  // Pick the next sort_order.
  const { data: max } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", p.productId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = (max?.[0]?.sort_order ?? -1) + 1;

  // If this is being flagged primary, clear any existing primary for the same
  // product first — the schema has a partial unique index that would 409.
  if (p.isPrimary) {
    await supabase.from("product_images").update({ is_primary: false }).eq("product_id", p.productId).eq("is_primary", true);
  }

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: p.productId,
      url: p.url,
      alt_text: p.altText ?? null,
      is_primary: p.isPrimary ?? false,
      sort_order: nextOrder,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "create",
    entityType: "product_image",
    entityId: data.id,
    summary: `Added image to product ${p.productId}`,
    after: p,
  });
  refresh(p.productId);
  return { ok: true, id: data.id };
}

export async function setPrimaryImage(input: unknown): Promise<ImageResult> {
  await requireAdmin();
  const parsed = SetPrimaryImageInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id, productId } = parsed.data;

  const supabase = await createClient();
  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId).eq("is_primary", true);
  const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "update",
    entityType: "product_image",
    entityId: id,
    summary: `Set primary image for product ${productId}`,
  });
  refresh(productId);
  return { ok: true, id };
}

export async function removeProductImage(input: unknown): Promise<ImageResult> {
  await requireAdmin();
  const parsed = RemoveImageInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("product_images").select("*").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "Image not found." };
  const { error } = await supabase.from("product_images").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "delete",
    entityType: "product_image",
    entityId: id,
    summary: `Removed image from product ${before.product_id}`,
    before,
  });
  refresh(before.product_id);
  return { ok: true };
}

export async function reorderProductImages(input: unknown): Promise<ImageResult> {
  await requireAdmin();
  const parsed = ReorderImagesInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { productId, orderedIds } = parsed.data;

  const supabase = await createClient();
  const results = await Promise.all(
    orderedIds.map((id, i) => supabase.from("product_images").update({ sort_order: i }).eq("id", id)),
  );
  const err = results.find((r) => r.error)?.error;
  if (err) return { ok: false, error: err.message };
  refresh(productId);
  return { ok: true };
}
