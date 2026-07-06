import { createClient } from "./supabase/server";

// Sales tax lookup. Rates live in the `tax_rates` table so a manager can
// change them without a deploy — grep for tax_rates in migration_007 for the
// initial seed.
//
// Assumptions (defense-in-depth documented so nobody accidentally rolls
// this out without thinking about it):
//   • Rate is in basis points (100 = 1%) to keep arithmetic in integers.
//   • Only state-level rate here. City / county add-ons are their own thing
//     and vary by ZIP — plug in an Avalara/TaxJar call before shipping to
//     high-audit states.
//   • KS in-state pickup + KS ship-to both use the KS rate.
//   • Missing state (customer in NY, etc.) → tax = 0 with a warning. Do NOT
//     silently charge no tax in production without confirming the farm is
//     registered to collect in that state.

export interface TaxQuote {
  taxCents: number;
  rateBp: number;
  stateCode: string | null;
  label: string | null;
  warning?: string;
}

const KANSAS_LOCAL_STATE = "KS";

// Rough US state ZIP → state mapping for the first digit of the ZIP. We use
// this only as a last-resort inference — the real input source is a customer
// picking their state on the checkout form.
export function inferStateFromZip(zip: string): string | null {
  const clean = zip.trim().slice(0, 5);
  if (!/^\d{5}$/.test(clean)) return null;
  const n = Number(clean);
  // Best-effort partial mapping for our ship-to whitelist. Anything outside
  // returns null so the caller falls back to charging zero + warning.
  if (n >= 66000 && n <= 67999) return "KS";
  if (n >= 63000 && n <= 65999) return "MO";
  if (n >= 80000 && n <= 81999) return "CO";
  if (n >= 68000 && n <= 69999) return "NE";
  if (n >= 73000 && n <= 74999) return "OK";
  return null;
}

// Parses a "state" out of a free-form address blob. Very approximate — the
// canonical input is a picked state code, this is here so a legacy blob
// address still gets some kind of tax quote.
export function extractStateCode(address: string): string | null {
  const upper = address.toUpperCase();
  const match = upper.match(/\b([A-Z]{2})\s+\d{5}(?:-\d{4})?\b/);
  if (match) return match[1];
  const zipMatch = upper.match(/\b(\d{5})(?:-\d{4})?\b/);
  if (zipMatch) return inferStateFromZip(zipMatch[1]);
  return null;
}

export async function quoteTax(subtotalCents: number, stateCode: string | null): Promise<TaxQuote> {
  if (!stateCode) {
    return { taxCents: 0, rateBp: 0, stateCode: null, label: null, warning: "Tax skipped — no state." };
  }
  const upperState = stateCode.toUpperCase();
  const supabase = await createClient();
  const { data } = await supabase.from("tax_rates").select("state_code, rate_bp, label").eq("state_code", upperState).maybeSingle();
  if (!data) {
    return {
      taxCents: 0,
      rateBp: 0,
      stateCode: upperState,
      label: null,
      warning: `No tax rate on file for ${upperState}. Charging $0 — confirm registration before selling here.`,
    };
  }
  const taxCents = Math.round((subtotalCents * data.rate_bp) / 10_000);
  return { taxCents, rateBp: data.rate_bp, stateCode: upperState, label: data.label };
}

// Kansas is our home state — used by the POS ticket for in-store sales.
export async function homeStateTax(subtotalCents: number): Promise<TaxQuote> {
  return quoteTax(subtotalCents, KANSAS_LOCAL_STATE);
}
