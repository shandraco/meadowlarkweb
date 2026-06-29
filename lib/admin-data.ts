import { createClient } from "./supabase/server";
import type { Order, OrderItem, Product } from "./types";

export type OrderWithItems = Order & {
  order_items: Pick<OrderItem, "name_snapshot" | "quantity" | "line_total_cents">[];
};

// Recent orders from BOTH channels, newest first, with their line items.
export async function getOrders(limit = 50): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(name_snapshot, quantity, line_total_cents)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as OrderWithItems[];
}

export interface SalesSummary {
  paidOrders: number;
  revenueCents: number;
  onlineCents: number;
  posCents: number;
  onlineOrders: number;
  posOrders: number;
}

// Aggregates over PAID orders (computed in JS — fine at demo scale).
export async function getSalesSummary(): Promise<SalesSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("total_cents, channel")
    .eq("status", "paid");
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Pick<Order, "total_cents" | "channel">[];
  const s: SalesSummary = {
    paidOrders: rows.length,
    revenueCents: 0,
    onlineCents: 0,
    posCents: 0,
    onlineOrders: 0,
    posOrders: 0,
  };
  for (const r of rows) {
    s.revenueCents += r.total_cents;
    if (r.channel === "online") {
      s.onlineCents += r.total_cents;
      s.onlineOrders += 1;
    } else {
      s.posCents += r.total_cents;
      s.posOrders += 1;
    }
  }
  return s;
}

export async function getProductsAdmin(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

import type { StockMovement } from "./types";

export async function getStockMovements(productId: string, limit = 20): Promise<StockMovement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stock_movements")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as StockMovement[];
}
