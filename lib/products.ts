import { createClient } from "./supabase/server";
import type { Product } from "./types";

// Catalog reads use the request-scoped server client (anon key + RLS:
// "public read active products"). No secret key needed for browsing.

export async function getActiveProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load product: ${error.message}`);
  return data ?? null;
}

// Group a flat catalog into the tier sections the storefront renders.
export function groupByTier(products: Product[]): { tier: string; items: Product[] }[] {
  const order = ["Flagship", "Sturnella Reserve", "Fine Cider", "Farm Store"];
  const map = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.tier ?? "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return [...map.entries()]
    .sort((a, b) => {
      const ia = order.indexOf(a[0]);
      const ib = order.indexOf(b[0]);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map(([tier, items]) => ({ tier, items }));
}
