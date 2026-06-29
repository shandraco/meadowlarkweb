"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export interface UpdateProductResult {
  ok: boolean;
  error?: string;
}

// Updates price / stock / active for a product. Staff-only via RLS + guard.
export async function updateProduct(input: {
  id: string;
  priceCents: number;
  stockQuantity: number;
  active: boolean;
}): Promise<UpdateProductResult> {
  await requireAdmin();

  if (!Number.isFinite(input.priceCents) || input.priceCents < 0)
    return { ok: false, error: "Invalid price." };
  if (!Number.isInteger(input.stockQuantity) || input.stockQuantity < 0)
    return { ok: false, error: "Invalid stock." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      price_cents: Math.round(input.priceCents),
      stock_quantity: input.stockQuantity,
      active: input.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/store");
  return { ok: true };
}
