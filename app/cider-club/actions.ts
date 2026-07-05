"use server";

import { revalidatePath } from "next/cache";
import { joinCiderClub, type JoinClubInput } from "@/lib/subscriptions";

export interface JoinResult {
  ok: boolean;
  memberNumber?: number;
  token?: string;
  error?: string;
}

export async function joinClub(input: JoinClubInput): Promise<JoinResult> {
  if (!input.customer.name?.trim() || !input.customer.email?.trim()) {
    return { ok: false, error: "Name and email are required." };
  }
  if (input.fulfillmentMode === "ship" && !input.shippingAddress?.trim()) {
    return { ok: false, error: "Shipping address required for shipped members." };
  }
  try {
    const r = await joinCiderClub(input);
    revalidatePath("/admin/subscriptions");
    return { ok: true, memberNumber: r.memberNumber, token: r.token };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not sign up." };
  }
}
