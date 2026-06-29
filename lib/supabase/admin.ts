import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

// Service-role client — bypasses RLS. SERVER ONLY. Never import in a Client
// Component. Used for trusted writes (creating orders, the Stripe webhook).
let _admin: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!_admin) {
    _admin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return _admin;
}
