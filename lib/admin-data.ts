import { createClient } from "./supabase/server";
import type { Order, OrderItem, Product, StockMovement } from "./types";

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

export interface LocationBreakdown {
  locationId: string | null;
  locationName: string;
  orders: number;
  revenueCents: number;
}

export interface CashierBreakdown {
  cashierId: string;
  cashierName: string;
  orders: number;
  revenueCents: number;
}

export interface SalesSummary {
  paidOrders: number;
  revenueCents: number;
  onlineCents: number;
  posCents: number;
  onlineOrders: number;
  posOrders: number;
  byLocation: LocationBreakdown[];
  byCashier: CashierBreakdown[];
}

// Aggregates over PAID orders. Cheap at demo scale; if the orders table grows
// past a few tens of thousands, move this into a materialized view.
export async function getSalesSummary(): Promise<SalesSummary> {
  const supabase = await createClient();
  const [ordersResp, locsResp, profilesResp] = await Promise.all([
    supabase.from("orders").select("total_cents, channel, location_id, created_by").eq("status", "paid"),
    supabase.from("locations").select("id, name"),
    supabase.from("profiles").select("id, full_name"),
  ]);
  if (ordersResp.error) throw new Error(ordersResp.error.message);

  const rows = (ordersResp.data ?? []) as Pick<Order, "total_cents" | "channel" | "location_id" | "created_by">[];
  const locName = new Map((locsResp.data ?? []).map((l) => [l.id, l.name]));
  const cashierName = new Map((profilesResp.data ?? []).map((p) => [p.id, p.full_name ?? "Unknown"]));

  const locAgg = new Map<string | null, LocationBreakdown>();
  const cashAgg = new Map<string, CashierBreakdown>();

  const s: SalesSummary = {
    paidOrders: rows.length,
    revenueCents: 0,
    onlineCents: 0,
    posCents: 0,
    onlineOrders: 0,
    posOrders: 0,
    byLocation: [],
    byCashier: [],
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

    // Location breakdown — group online under a synthetic entry.
    const locKey = r.channel === "online" ? null : r.location_id ?? "unassigned";
    const displayName =
      r.channel === "online"
        ? "Online store"
        : r.location_id
          ? locName.get(r.location_id) ?? "Unknown location"
          : "POS · no location";
    const bl = locAgg.get(locKey) ?? { locationId: locKey, locationName: displayName, orders: 0, revenueCents: 0 };
    bl.orders += 1;
    bl.revenueCents += r.total_cents;
    locAgg.set(locKey, bl);

    if (r.channel === "pos" && r.created_by) {
      const bc = cashAgg.get(r.created_by) ?? {
        cashierId: r.created_by,
        cashierName: cashierName.get(r.created_by) ?? "Cashier",
        orders: 0,
        revenueCents: 0,
      };
      bc.orders += 1;
      bc.revenueCents += r.total_cents;
      cashAgg.set(r.created_by, bc);
    }
  }

  s.byLocation = [...locAgg.values()].sort((a, b) => b.revenueCents - a.revenueCents);
  s.byCashier = [...cashAgg.values()].sort((a, b) => b.revenueCents - a.revenueCents);
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
