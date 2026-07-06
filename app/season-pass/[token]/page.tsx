import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your Season Pass | Meadowlark Farm" };

export default async function PassRedeemPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: pass } = await supabase
    .from("season_passes")
    .select("pass_number, customer_name, expires_at, status")
    .eq("redeem_token", token)
    .maybeSingle();

  if (!pass) notFound();

  const expiresAt = new Date(pass.expires_at);
  const active = pass.status === "active" && expiresAt > new Date();

  return (
    <section className="pt-36 pb-28 min-h-[60vh]">
      <div className="max-w-md mx-auto px-6 md:px-12">
        <div
          className={`border-2 p-8 md:p-10 text-center ${
            active ? "border-orchard bg-orchard/5" : "border-stone/30 bg-wheat-dark"
          }`}
        >
          <p
            className={`text-xs tracking-widest uppercase font-light mb-3 ${
              active ? "text-orchard" : "text-stone"
            }`}
          >
            {active ? "Active pass" : pass.status === "revoked" ? "Revoked" : "Expired"}
          </p>
          <p className="font-serif text-7xl text-meadow mb-2">#{pass.pass_number}</p>
          <p className="font-serif text-lg text-ink mb-4">{pass.customer_name}</p>
          <div className="border-t border-meadow/15 pt-4 mt-4">
            <p className="text-xs tracking-widest uppercase text-stone font-light">Good through</p>
            <p className="font-serif text-2xl text-meadow">
              {expiresAt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <p className="text-xs text-ink-soft font-light text-center mt-6">
          Show this screen at the shop counter. Bookmark it on your phone.
        </p>
        <div className="text-center mt-4">
          <Link href="/visit" className="text-xs tracking-widest uppercase text-cider hover:text-cider-deep">
            Plan a visit →
          </Link>
        </div>
      </div>
    </section>
  );
}
