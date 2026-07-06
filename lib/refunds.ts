import { createClient } from "./supabase/server";
import type { Database } from "./database.types";

export type Refund = Database["public"]["Tables"]["refunds"]["Row"];

export async function getRefundsForOrder(orderId: string): Promise<Refund[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("refunds").select("*").eq("order_id", orderId).order("created_at", { ascending: false });
  return (data ?? []) as Refund[];
}

export async function getOrderWithItems(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();
  return data;
}
