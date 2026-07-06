import { createClient } from "./supabase/server";
import { getSupabaseAdmin } from "./supabase/admin";
import type { Database } from "./database.types";

export type GiftMembership = Database["public"]["Tables"]["gift_memberships"]["Row"];

export async function getAllGifts(limit = 200): Promise<GiftMembership[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("gift_memberships").select("*").order("created_at", { ascending: false }).limit(limit);
  return (data ?? []) as GiftMembership[];
}

export async function getGiftByToken(token: string): Promise<GiftMembership | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("gift_memberships").select("*").eq("claim_token", token).maybeSingle();
  return (data as GiftMembership | null) ?? null;
}

export interface PurchaseGiftInput {
  planId: string;
  buyer: { name: string; email: string };
  recipient: { name: string; email: string };
  message?: string;
  priceCents: number;
}

export async function createGift(input: PurchaseGiftInput): Promise<{
  id: string;
  giftNumber: number;
  claimToken: string;
}> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("gift_memberships")
    .insert({
      plan_id: input.planId,
      buyer_name: input.buyer.name.trim(),
      buyer_email: input.buyer.email.trim().toLowerCase(),
      recipient_name: input.recipient.name.trim(),
      recipient_email: input.recipient.email.trim().toLowerCase(),
      message: input.message?.trim() || null,
      price_cents: input.priceCents,
    })
    .select("id, gift_number, claim_token")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id, giftNumber: data.gift_number, claimToken: data.claim_token };
}

export interface ClaimGiftInput {
  token: string;
  fulfillmentMode: "ship" | "pickup";
  shippingAddress?: string;
  phone?: string;
}

// Redeems a pending gift into a real subscription for the recipient.
export async function claimGift(
  input: ClaimGiftInput,
): Promise<{ ok: true; subscriptionId: string; memberToken: string } | { ok: false; error: string }> {
  const admin = getSupabaseAdmin();

  const { data: gift, error: giftErr } = await admin
    .from("gift_memberships")
    .select("*")
    .eq("claim_token", input.token)
    .maybeSingle();
  if (giftErr) return { ok: false, error: giftErr.message };
  if (!gift) return { ok: false, error: "Gift not found." };
  if (gift.status !== "pending") return { ok: false, error: `This gift is already ${gift.status}.` };
  if (new Date(gift.expires_at) < new Date()) return { ok: false, error: "This gift has expired." };
  if (input.fulfillmentMode === "ship" && !input.shippingAddress?.trim()) {
    return { ok: false, error: "Shipping address required for shipped members." };
  }

  const { data: sub, error: subErr } = await admin
    .from("subscriptions")
    .insert({
      plan_id: gift.plan_id,
      status: "active",
      customer_name: gift.recipient_name,
      customer_email: gift.recipient_email,
      customer_phone: input.phone?.trim() || null,
      shipping_address: input.shippingAddress?.trim() || null,
      fulfillment_mode: input.fulfillmentMode,
      notes: `Claimed gift #${gift.gift_number} from ${gift.buyer_name}`,
    })
    .select("id, member_token")
    .single();
  if (subErr) return { ok: false, error: subErr.message };

  const { error: updateErr } = await admin
    .from("gift_memberships")
    .update({
      status: "claimed",
      claimed_at: new Date().toISOString(),
      claimed_subscription_id: sub.id,
    })
    .eq("id", gift.id);
  if (updateErr) return { ok: false, error: updateErr.message };

  return { ok: true, subscriptionId: sub.id, memberToken: sub.member_token };
}
