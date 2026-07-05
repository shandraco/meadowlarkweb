import { createClient } from "./supabase/server";
import { getSupabaseAdmin } from "./supabase/admin";
import type { SubscriptionPlan, Subscription, SubscriptionShipment } from "./types";

export async function getActivePlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return (data ?? []) as SubscriptionPlan[];
}

export async function getAllPlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("subscription_plans").select("*").order("sort_order");
  return (data ?? []) as SubscriptionPlan[];
}

export async function getPlanById(id: string): Promise<SubscriptionPlan | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("subscription_plans").select("*").eq("id", id).maybeSingle();
  return (data as SubscriptionPlan | null) ?? null;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .order("started_at", { ascending: false });
  return (data ?? []) as Subscription[];
}

export async function getSubscriptionByToken(token: string): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("subscriptions").select("*").eq("member_token", token).maybeSingle();
  return (data as Subscription | null) ?? null;
}

export async function getShipmentsForSubscription(subscriptionId: string): Promise<SubscriptionShipment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscription_shipments")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .order("ship_date", { ascending: false });
  return (data ?? []) as SubscriptionShipment[];
}

export async function getShipmentQueue(): Promise<(SubscriptionShipment & { customer_name: string; customer_email: string })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscription_shipments")
    .select("*, subscriptions(customer_name, customer_email)")
    .in("status", ["queued", "packed"])
    .order("ship_date");
  return (
    (data ?? []).map((row) => {
      const sub = (row as unknown as { subscriptions?: { customer_name: string; customer_email: string } }).subscriptions;
      return {
        ...(row as SubscriptionShipment),
        customer_name: sub?.customer_name ?? "",
        customer_email: sub?.customer_email ?? "",
      };
    })
  );
}

export interface JoinClubInput {
  planId: string;
  customer: { name: string; email: string; phone?: string };
  shippingAddress?: string;
  fulfillmentMode: "ship" | "pickup";
  ageConfirmed: boolean;
}

export async function joinCiderClub(input: JoinClubInput): Promise<{ id: string; memberNumber: number; token: string }> {
  if (!input.ageConfirmed) throw new Error("You must confirm you are 21 or older.");
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("subscriptions")
    .insert({
      plan_id: input.planId,
      status: "active",
      customer_name: input.customer.name.trim(),
      customer_email: input.customer.email.trim(),
      customer_phone: input.customer.phone?.trim() || null,
      shipping_address: input.shippingAddress?.trim() || null,
      fulfillment_mode: input.fulfillmentMode,
    })
    .select("id, member_number, member_token")
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data!.id as string,
    memberNumber: data!.member_number as number,
    token: data!.member_token as string,
  };
}
