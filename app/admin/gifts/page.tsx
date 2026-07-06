import { getAllGifts } from "@/lib/gift-memberships";
import { formatUSD } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gift Memberships | Meadowlark Admin" };

export default async function GiftsAdminPage() {
  const gifts = await getAllGifts();
  const pending = gifts.filter((g) => g.status === "pending").length;
  const claimed = gifts.filter((g) => g.status === "claimed").length;

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-label mb-2">Cider Club</p>
          <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none">Gift memberships</h1>
          <p className="text-ink-soft font-light mt-2">Purchased memberships waiting for the recipient to claim.</p>
        </div>
        <div className="text-right">
          <p className="text-xs tracking-widest uppercase text-stone font-light">Pending / claimed</p>
          <p className="font-serif text-3xl text-meadow">
            {pending} / <span className="text-orchard">{claimed}</span>
          </p>
        </div>
      </div>

      {gifts.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6">
          No gifts yet. Purchase URL: <a href="/gift" className="text-cider underline">/gift</a>
        </p>
      ) : (
        <div className="border border-meadow/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-wheat-dark/40 text-left">
                {["#", "Buyer", "Recipient", "Status", "Amount", "Created"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-meadow/10">
              {gifts.map((g) => (
                <tr key={g.id} className="hover:bg-wheat-dark/20">
                  <td className="px-4 py-3 font-serif text-cider whitespace-nowrap">#{g.gift_number}</td>
                  <td className="px-4 py-3 text-ink">
                    {g.buyer_name}
                    <span className="block text-xs text-ink-soft font-light">{g.buyer_email}</span>
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {g.recipient_name}
                    <span className="block text-xs text-ink-soft font-light">{g.recipient_email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] tracking-widest uppercase px-2 py-1 ${
                        g.status === "claimed"
                          ? "bg-orchard/15 text-orchard"
                          : g.status === "pending"
                            ? "bg-sunflower/25 text-ink"
                            : "bg-stone/20 text-stone"
                      }`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-meadow whitespace-nowrap">{formatUSD(g.price_cents)}</td>
                  <td className="px-4 py-3 text-ink-soft font-light whitespace-nowrap">
                    {new Date(g.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
