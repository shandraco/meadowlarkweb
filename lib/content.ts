import { createClient } from "./supabase/server";

// Loads stored site-content blocks by key → { key: { field: value } }.
export async function getContentMap(keys: string[]): Promise<Record<string, Record<string, string>>> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_content").select("key, value").in("key", keys);
  const map: Record<string, Record<string, string>> = {};
  for (const row of data ?? []) {
    map[row.key] = (row.value as Record<string, string>) ?? {};
  }
  return map;
}
