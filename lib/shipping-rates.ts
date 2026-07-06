import { createClient } from "./supabase/server";
import { extractStateCode } from "./tax";

export interface ShippingQuote {
  costCents: number;
  stateCode: string | null;
  daysMin: number;
  daysMax: number;
  notes: string | null;
  supported: boolean;
  warning?: string;
}

const UNSUPPORTED: ShippingQuote = {
  costCents: 0,
  stateCode: null,
  daysMin: 0,
  daysMax: 0,
  notes: null,
  supported: false,
  warning: "We can't ship cider to this state yet. Choose farm pickup or try Kansas / Missouri / Colorado / Nebraska / Oklahoma.",
};

// Bottle count controls the per-bottle surcharge — used to model heavier
// packages without needing a real dim-weight lookup.
export async function quoteShipping(
  subtotalCents: number,
  bottleCount: number,
  stateCodeOrAddress: string | null,
): Promise<ShippingQuote> {
  if (!stateCodeOrAddress) return { ...UNSUPPORTED, warning: "Enter a shipping address to see rates." };

  const stateCode =
    stateCodeOrAddress.length === 2
      ? stateCodeOrAddress.toUpperCase()
      : extractStateCode(stateCodeOrAddress);
  if (!stateCode) return UNSUPPORTED;

  const supabase = await createClient();
  const { data } = await supabase
    .from("shipping_rates")
    .select("state_code, base_cents, per_bottle_cents, days_min, days_max, notes, active")
    .eq("state_code", stateCode)
    .eq("active", true)
    .maybeSingle();
  if (!data) return { ...UNSUPPORTED, stateCode };

  const cost = data.base_cents + data.per_bottle_cents * Math.max(0, bottleCount);
  return {
    costCents: cost,
    stateCode,
    daysMin: data.days_min,
    daysMax: data.days_max,
    notes: data.notes,
    supported: true,
  };
}

// A very small helper: subtotalCents isn't used for tiers today, but leaving
// the parameter so the free-shipping-over-$X rule can slot in later without
// touching callers.
export function formatDeliveryEstimate(q: ShippingQuote): string {
  if (!q.supported) return "";
  if (q.daysMin === q.daysMax) return `${q.daysMin} day${q.daysMin === 1 ? "" : "s"}`;
  return `${q.daysMin}–${q.daysMax} days`;
}
