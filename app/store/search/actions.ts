"use server";

import { searchActiveProducts } from "@/lib/products";
import { SearchProductsInput, firstIssue } from "@/lib/validation";
import type { Product } from "@/lib/types";

export interface SearchResult {
  ok: boolean;
  results?: Product[];
  error?: string;
}

// Server action wrapping searchActiveProducts. Called from the nav search
// bar's live-typeahead. Rate limiting isn't needed because the query is
// read-only and RLS already restricts it to the public product view.
export async function searchProducts(input: unknown): Promise<SearchResult> {
  const parsed = SearchProductsInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  try {
    const results = await searchActiveProducts(parsed.data.q, parsed.data.limit ?? 12);
    return { ok: true, results };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Search failed." };
  }
}
