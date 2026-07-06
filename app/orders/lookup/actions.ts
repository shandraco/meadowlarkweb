"use server";

import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { writeAudit } from "@/lib/audit";
import { consumeRateLimit } from "@/lib/rate-limit";
import { email as emailSchema, firstIssue } from "@/lib/validation";

// Two-factor style lookup: token from the confirmation link URL + email
// address the order was placed with. Runs via the service-role admin client
// through the security-definer lookup_order_by_token() RPC, which returns
// nothing when the pair doesn't match.
const LookupInput = z
  .object({
    token: z.string().length(32).regex(/^[a-f0-9]+$/, "Invalid link."),
    email: emailSchema,
  })
  .strict();

export interface LookupOrderResult {
  ok: boolean;
  error?: string;
  order?: {
    orderNumber: number;
    channel: string;
    status: string;
    createdAt: string;
    paidAt: string | null;
    customerName: string | null;
    customerEmail: string | null;
    totalCents: number;
    subtotalCents: number;
    taxCents: number;
    notes: string | null;
    items: { name: string; quantity: number; unitCents: number; lineCents: number }[];
  };
}

interface RpcOrderRow {
  order_data: {
    order_number: number;
    channel: string;
    status: string;
    created_at: string;
    paid_at: string | null;
    customer_name: string | null;
    customer_email: string | null;
    total_cents: number;
    subtotal_cents: number;
    tax_cents: number;
    notes: string | null;
  } | null;
  items_data:
    | {
        name_snapshot: string;
        quantity: number;
        unit_price_cents: number;
        line_total_cents: number;
      }[]
    | null;
}

export async function lookupOrder(input: unknown): Promise<LookupOrderResult> {
  const parsed = LookupInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { token, email } = parsed.data;

  // 8 attempts / 15 min per email. Discourages brute-forcing email against
  // a known token.
  const ok = await consumeRateLimit("order_lookup", email, 8, 900);
  if (!ok) return { ok: false, error: "Too many attempts. Please try again shortly." };

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.rpc("lookup_order_by_token", { p_token: token, p_email: email });
  if (error) return { ok: false, error: "Could not look up your order." };

  const rows = (data ?? []) as RpcOrderRow[];
  const row = rows[0];
  if (!row?.order_data) {
    await writeAudit({
      action: "other",
      entityType: "order",
      summary: `Failed order lookup for ${email}`,
    });
    return { ok: false, error: "That order + email combination doesn't match." };
  }

  const o = row.order_data;
  const items = (row.items_data ?? []).map((i) => ({
    name: i.name_snapshot,
    quantity: i.quantity,
    unitCents: i.unit_price_cents,
    lineCents: i.line_total_cents,
  }));

  return {
    ok: true,
    order: {
      orderNumber: o.order_number,
      channel: o.channel,
      status: o.status,
      createdAt: o.created_at,
      paidAt: o.paid_at,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      totalCents: o.total_cents,
      subtotalCents: o.subtotal_cents,
      taxCents: o.tax_cents,
      notes: o.notes,
      items,
    },
  };
}
