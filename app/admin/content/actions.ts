"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { SaveContentInput, firstIssue } from "@/lib/validation";

export interface SaveContentResult {
  ok: boolean;
  error?: string;
}

export async function saveContent(key: unknown, values: unknown): Promise<SaveContentResult> {
  const session = await requireAdmin();
  const parsed = SaveContentInput.safeParse({ key, values });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const { key: k, values: v } = parsed.data;

  const supabase = await createClient();
  const { data: before } = await supabase.from("site_content").select("value").eq("key", k).maybeSingle();

  const { error } = await supabase.from("site_content").upsert(
    {
      key: k,
      value: v,
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    },
    { onConflict: "key" },
  );

  if (error) return { ok: false, error: error.message };

  await writeAudit({
    action: "update",
    entityType: "site_content",
    entityId: k,
    summary: `Updated site content "${k}"`,
    before: before?.value ?? null,
    after: v,
  });

  revalidatePath("/");
  return { ok: true };
}
