import { createClient } from "./supabase/server";
import type { Database } from "./database.types";

export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("is_primary", { ascending: false })
    .order("sort_order")
    .order("created_at");
  return (data ?? []) as ProductImage[];
}

// The store list card uses only the primary image. If none is flagged we
// fall back to products.image_url (the legacy single-image column).
export async function getPrimaryImages(productIds: string[]): Promise<Map<string, string>> {
  if (productIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_images")
    .select("product_id, url, is_primary, sort_order")
    .in("product_id", productIds)
    .order("is_primary", { ascending: false })
    .order("sort_order");
  const map = new Map<string, string>();
  for (const row of (data ?? []) as Pick<ProductImage, "product_id" | "url">[]) {
    if (!map.has(row.product_id)) map.set(row.product_id, row.url);
  }
  return map;
}
