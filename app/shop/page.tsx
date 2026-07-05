import { redirect } from "next/navigation";

// Legacy path — the real storefront is /store. The old hardcoded /shop page
// was replaced by the CMS-driven, Supabase-backed catalog under /store.
export default function ShopPage() {
  redirect("/store");
}
