import { createClient } from "./supabase/server";
import type { Vendor } from "./types";

export async function getVendors(): Promise<Vendor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("vendors").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Vendor[];
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("vendors").select("*").eq("id", id).maybeSingle();
  return (data as Vendor | null) ?? null;
}

export interface VendorSalesRow {
  vendor_id: string;
  vendor_name: string;
  split_pct: number;
  order_count: number;
  gross_cents: number;
  vendor_owed_cents: number;
}

export async function getVendorSalesSummary(): Promise<VendorSalesRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("vendor_sales_summary").select("*");
  return (data ?? []) as VendorSalesRow[];
}
