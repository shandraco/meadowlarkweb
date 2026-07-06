import Link from "next/link";
import { getAllPasses } from "@/lib/season-pass";
import { formatUSD } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Season Passes | Meadowlark Admin" };

export default async function SeasonPassesAdminPage() {
  const passes = await getAllPasses();
  const active = passes.filter((p) => p.status === "active" && new Date(p.expires_at) > new Date()).length;
  const expired = passes.filter((p) => p.status !== "active" || new Date(p.expires_at) <= new Date()).length;

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-label mb-2">Farm access</p>
          <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none">Season passes</h1>
          <p className="text-ink-soft font-light mt-2 max-w-xl">Everyone who&apos;s bought unlimited annual farm entry.</p>
        </div>
        <div className="text-right">
          <p className="text-xs tracking-widest uppercase text-stone font-light">Active</p>
          <p className="font-serif text-3xl text-orchard">{active}</p>
          <p className="text-xs text-stone/70 font-light">{expired} expired / revoked</p>
        </div>
      </div>

      {passes.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6">
          No passes issued yet. Purchase URL:{" "}
          <a href="/season-pass" className="text-cider underline">
            /season-pass
          </a>
        </p>
      ) : (
        <div className="border border-meadow/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-wheat-dark/40 text-left">
                {["#", "Holder", "Email", "Purchased", "Expires", "Status", "Redeem link"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-meadow/10">
              {passes.map((p) => {
                const expiresAt = new Date(p.expires_at);
                const stillActive = p.status === "active" && expiresAt > new Date();
                return (
                  <tr key={p.id} className="hover:bg-wheat-dark/20">
                    <td className="px-4 py-3 font-serif text-cider whitespace-nowrap">#{p.pass_number}</td>
                    <td className="px-4 py-3 text-ink">{p.customer_name}</td>
                    <td className="px-4 py-3 text-ink-soft font-light">{p.customer_email}</td>
                    <td className="px-4 py-3 text-ink-soft font-light whitespace-nowrap">
                      {new Date(p.purchased_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-ink-soft font-light whitespace-nowrap">
                      {expiresAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] tracking-widest uppercase px-2 py-1 ${
                          stillActive
                            ? "bg-orchard/15 text-orchard"
                            : p.status === "revoked"
                              ? "bg-cider/20 text-cider"
                              : "bg-stone/20 text-stone"
                        }`}
                      >
                        {stillActive ? "Active" : p.status}
                      </span>
                      <span className="ml-2 text-xs text-ink-soft font-light">
                        ${(p.price_cents / 100).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-cider">
                      <Link href={`/season-pass/${p.redeem_token}`} target="_blank" className="hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-ink-soft font-light mt-8">
        Price: <span className="text-cider">{formatUSD(5000)}</span> · One year from purchase · Non-transferable.
      </p>
    </div>
  );
}
