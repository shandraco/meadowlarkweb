import { createClient } from "./supabase/server";
import type { ShippingProvider } from "./types";

export async function getShippingProviders(): Promise<ShippingProvider[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("shipping_providers").select("*").order("name");
  return (data ?? []) as ShippingProvider[];
}

// Given the ship-to state, decide which provider handles the order. Falls
// back to Vino Shipper for anything outside Kansas. Local KS orders go to the
// farm's own fulfillment (`farm_direct`).
export async function pickShippingProvider(state: string): Promise<ShippingProvider | null> {
  const providers = await getShippingProviders();
  const active = providers.filter((p) => p.active);
  const match = active.find((p) => p.states_covered.includes(state.toUpperCase()));
  return match ?? active.find((p) => p.code === "vino_shipper") ?? null;
}

// ---- Vino Shipper adapter interface (thin, real API wiring pending) ------
// The intent is: any code that needs to forward an order or push a product
// update calls these functions. When credentials + a real endpoint are ready,
// we drop the actual HTTP calls in — the callers don't change.

export interface OutboundOrderPayload {
  externalOrderNumber: number;
  customer: { name: string; email: string; phone?: string; address: string };
  items: { name: string; qty: number; unit_price_cents: number }[];
  totalCents: number;
}

export interface OutboundProductPayload {
  slug: string;
  name: string;
  priceCents: number;
  salePriceCents?: number | null;
  stockQuantity: number;
  imageUrl?: string | null;
  description?: string | null;
}

export const vinoShipperAdapter = {
  configured(): boolean {
    return !!process.env.VINO_SHIPPER_API_KEY && !!process.env.VINO_SHIPPER_BASE_URL;
  },

  async forwardOrder(_payload: OutboundOrderPayload): Promise<{ ok: boolean; providerRef?: string; error?: string }> {
    if (!this.configured()) {
      // Log the intent so ops can hand-forward while the bridge is being wired up.
      console.info("[vino_shipper] forwardOrder pending (not yet configured)", _payload.externalOrderNumber);
      return { ok: true, providerRef: `pending_${_payload.externalOrderNumber}` };
    }
    // Real fetch() call goes here once the API contract is finalized.
    return { ok: false, error: "Vino Shipper adapter not implemented yet." };
  },

  async syncProduct(_payload: OutboundProductPayload): Promise<{ ok: boolean; error?: string }> {
    if (!this.configured()) {
      console.info("[vino_shipper] syncProduct pending (not yet configured)", _payload.slug);
      return { ok: true };
    }
    return { ok: false, error: "Vino Shipper adapter not implemented yet." };
  },
};
