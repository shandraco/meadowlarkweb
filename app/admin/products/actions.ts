"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import {
  AdjustStockInput,
  CreateProductInput,
  SetActiveInput,
  UpdateProductInput,
  firstIssue,
} from "@/lib/validation";

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

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

export async function uploadProductImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "No file." };
  if (file.size > 5_242_880) return { ok: false, error: "Image must be under 5 MB." };
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return { ok: false, error: "Only JPG, PNG, WebP, GIF, or AVIF images are allowed." };

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const admin = getSupabaseAdmin();
  const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { ok: false, error: error.message };

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  await writeAudit({
    action: "create",
    entityType: "product_image",
    entityId: path,
    summary: `Uploaded product image ${path}`,
    after: { path, url: data.publicUrl, size: file.size, type: file.type },
  });
  return { ok: true, url: data.publicUrl };
}

// ---- Create ---------------------------------------------------------------
export async function createProduct(input: unknown): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = CreateProductInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const p = parsed.data;

  const supabase = await createClient();
  const slug = p.slug?.trim() ? slugify(p.slug) : slugify(p.name);
  if (!slug) return { ok: false, error: "Could not derive a slug from the name." };

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: p.name,
      slug,
      tier: p.tier || null,
      category: p.category,
      description: p.description || null,
      price_cents: p.priceCents,
      abv: p.abv || null,
      image_url: p.imageUrl || null,
      sort_order: p.sortOrder,
      stock_quantity: 0,
      active: true,
      vendor_id: p.vendorId ?? null,
      requires_age_check: p.requiresAgeCheck ?? p.category === "cider",
      sale_price_cents: p.salePriceCents ?? null,
      sale_starts_at: p.saleStartsAt ?? null,
      sale_ends_at: p.saleEndsAt ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message.includes("duplicate") ? "That slug is already taken." : error.message };
  }

  if (p.initialStock > 0) {
    await supabase.rpc("adjust_stock", {
      p_product: data.id,
      p_delta: p.initialStock,
      p_reason: "initial",
      p_note: "Opening stock",
      p_user: session.userId,
    });
  }

  await writeAudit({
    action: "create",
    entityType: "product",
    entityId: data.id,
    summary: `Created product "${p.name}" (${slug})`,
    after: { ...p, id: data.id, slug },
  });

  revalidateAll();
  return { ok: true, id: data.id };
}

// ---- Update content (never mutates stock) --------------------------------
export async function updateProductContent(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = UpdateProductInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const p = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("products").select("*").eq("id", p.id).maybeSingle();
  if (!before) return { ok: false, error: "Product not found." };

  const { error } = await supabase
    .from("products")
    .update({
      name: p.name,
      slug: slugify(p.slug || p.name),
      tier: p.tier || null,
      category: p.category,
      description: p.description || null,
      price_cents: p.priceCents,
      abv: p.abv || null,
      image_url: p.imageUrl || null,
      sort_order: p.sortOrder,
      vendor_id: p.vendorId ?? null,
      requires_age_check: p.requiresAgeCheck ?? p.category === "cider",
      sale_price_cents: p.salePriceCents ?? null,
      sale_starts_at: p.saleStartsAt ?? null,
      sale_ends_at: p.saleEndsAt ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", p.id);

  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "update",
    entityType: "product",
    entityId: p.id,
    summary: `Updated product "${p.name}"`,
    before,
    after: p,
  });

  revalidateAll();
  revalidatePath(`/admin/products/${p.id}`);
  return { ok: true, id: p.id };
}

export async function setProductActive(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = SetActiveInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { id, active } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("products").select("id, name, active").eq("id", id).maybeSingle();
  if (!before) return { ok: false, error: "Product not found." };

  const { error } = await supabase
    .from("products")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "status_change",
    entityType: "product",
    entityId: id,
    summary: `${active ? "Published" : "Hid"} product "${before.name}"`,
    before: { active: before.active },
    after: { active },
  });

  revalidateAll();
  return { ok: true, id };
}

// ---- Stock adjustment (audited) ------------------------------------------
export async function adjustStock(input: unknown): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = AdjustStockInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { productId, delta, reason, note, vendorId } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("products").select("id, name, stock_quantity").eq("id", productId).maybeSingle();
  if (!before) return { ok: false, error: "Product not found." };

  const { data: newQty, error } = await supabase.rpc("adjust_stock", {
    p_product: productId,
    p_delta: delta,
    p_reason: reason,
    p_note: note ?? null,
    p_user: session.userId,
  });
  if (error) return { ok: false, error: error.message };

  if (vendorId) {
    // adjust_stock() writes a movement row; stamp it with the vendor id.
    const { data: latest } = await supabase
      .from("stock_movements")
      .select("id")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (latest?.[0]) {
      await supabase.from("stock_movements").update({ vendor_id: vendorId }).eq("id", latest[0].id);
    }
  }

  await writeAudit({
    action: "stock_adjust",
    entityType: "product",
    entityId: productId,
    summary: `Stock ${delta > 0 ? "+" : ""}${delta} on "${before.name}" (reason: ${reason})`,
    before: { stock_quantity: before.stock_quantity },
    after: { stock_quantity: newQty, delta, reason, note, vendor_id: vendorId ?? null },
  });

  revalidateAll();
  revalidatePath(`/admin/products/${productId}`);
  return { ok: true, id: productId };
}
