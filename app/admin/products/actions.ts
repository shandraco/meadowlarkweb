"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import type { StockReason } from "@/lib/types";

const BUCKET = "product-images";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function revalidateAll() {
  revalidatePath("/admin/products");
  revalidatePath("/store");
  revalidatePath("/pos");
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

// ---- Image upload → Supabase Storage (returns public CDN URL) -------------
export interface UploadResult {
  ok: boolean;
  url?: string;
  error?: string;
}

export async function uploadProductImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "No file." };
  if (file.size > 5_242_880) return { ok: false, error: "Image must be under 5 MB." };

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const admin = getSupabaseAdmin();
  const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) return { ok: false, error: error.message };

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

// ---- Create -----------------------------------------------------------------
export interface ProductInput {
  name: string;
  slug?: string;
  tier: string;
  category: "cider" | "farm-good";
  description: string;
  priceCents: number;
  abv: string;
  imageUrl: string;
  sortOrder: number;
}

export async function createProduct(
  input: ProductInput & { initialStock: number },
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!input.name.trim()) return { ok: false, error: "Name is required." };
  if (!Number.isFinite(input.priceCents) || input.priceCents < 0)
    return { ok: false, error: "Invalid price." };

  const supabase = await createClient();
  const slug = (input.slug?.trim() ? slugify(input.slug) : slugify(input.name)) || crypto.randomUUID();

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name.trim(),
      slug,
      tier: input.tier.trim() || null,
      category: input.category,
      description: input.description.trim() || null,
      price_cents: Math.round(input.priceCents),
      abv: input.abv.trim() || null,
      image_url: input.imageUrl.trim() || null,
      sort_order: input.sortOrder,
      stock_quantity: 0,
      active: true,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message.includes("duplicate") ? "That slug is already taken." : error.message };
  }

  // Log the opening stock as an auditable movement.
  if (input.initialStock > 0) {
    await supabase.rpc("adjust_stock", {
      p_product: data!.id,
      p_delta: input.initialStock,
      p_reason: "initial",
      p_note: "Opening stock",
      p_user: session.userId,
    });
  }

  revalidateAll();
  return { ok: true, id: data!.id as string };
}

// ---- Update content (NOT stock — that goes through adjustStock) ------------
export async function updateProductContent(
  input: ProductInput & { id: string },
): Promise<ActionResult> {
  await requireAdmin();
  if (!input.name.trim()) return { ok: false, error: "Name is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name.trim(),
      slug: slugify(input.slug || input.name),
      tier: input.tier.trim() || null,
      category: input.category,
      description: input.description.trim() || null,
      price_cents: Math.round(input.priceCents),
      abv: input.abv.trim() || null,
      image_url: input.imageUrl.trim() || null,
      sort_order: input.sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);

  if (error) return { ok: false, error: error.message };
  revalidateAll();
  revalidatePath(`/admin/products/${input.id}`);
  return { ok: true, id: input.id };
}

export async function setProductActive(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll();
  return { ok: true, id };
}

// ---- Stock adjustment (audited) --------------------------------------------
export async function adjustStock(input: {
  productId: string;
  delta: number;
  reason: StockReason;
  note?: string;
}): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!Number.isInteger(input.delta) || input.delta === 0)
    return { ok: false, error: "Enter a non-zero whole number." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("adjust_stock", {
    p_product: input.productId,
    p_delta: input.delta,
    p_reason: input.reason,
    p_note: input.note?.trim() || null,
    p_user: session.userId,
  });
  if (error) return { ok: false, error: error.message };

  revalidateAll();
  revalidatePath(`/admin/products/${input.productId}`);
  return { ok: true, id: input.productId };
}
