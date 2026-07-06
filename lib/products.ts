import { createClient } from "./supabase/server";
import type { Product, PosCategory } from "./types";

export async function getPosCategories(): Promise<PosCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pos_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PosCategory[];
}

// Catalog reads use the request-scoped server client (anon key + RLS:
// "public read active products"). No secret key needed for browsing.

// Full-text-ish search on the public catalog. Uses ilike for portability;
// upgrade to Postgres `tsvector` + a GIN index once the catalog outgrows a
// few hundred SKUs.
export async function searchActiveProducts(q: string, limit = 20): Promise<Product[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  const supabase = await createClient();
  const like = `%${query.replace(/[%_]/g, "")}%`;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .or(`name.ilike.${like},description.ilike.${like},tier.ilike.${like}`)
    .order("sort_order")
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function findProductByBarcode(barcode: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode.trim())
    .eq("active", true)
    .maybeSingle();
  return (data as Product | null) ?? null;
}

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
