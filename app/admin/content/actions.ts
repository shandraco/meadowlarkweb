"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export interface SaveContentResult {
  ok: boolean;
  error?: string;
}

export async function saveContent(
  key: string,
  values: Record<string, string>,
): Promise<SaveContentResult> {
  const session = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("site_content").upsert(
    {
      key,
      value: values,
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    },
    { onConflict: "key" },
  );

  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  return { ok: true };
}
