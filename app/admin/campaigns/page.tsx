import Link from "next/link";
import { getAllCampaigns } from "@/lib/campaigns";

export const dynamic = "force-dynamic";
export const metadata = { title: "Discount Campaigns | Meadowlark Admin" };

export default async function CampaignsPage() {
  const campaigns = await getAllCampaigns();

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-label mb-2">Marketing</p>
          <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none">Discount campaigns</h1>
          <p className="text-ink-soft font-light mt-2 max-w-xl">
            Bundle products, dates, and copy for a sale. When a campaign goes live, its social post is queued for the connected
            Facebook/Instagram accounts.
          </p>
        </div>
        <Link href="/admin/campaigns/new" className="btn-primary">
          + New campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6">
          No campaigns yet. Create one when you want to shift stock or celebrate a season.
        </p>
      ) : (
        <div className="border border-meadow/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper-dark/40 text-left">
                {["Campaign", "Status", "Products", "Window", "Social", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-meadow/10">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-paper-dark/20">
                  <td className="px-4 py-3 font-serif text-ink">{c.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] tracking-widest uppercase px-2 py-1 ${
                        c.status === "live"
                          ? "bg-meadow/15 text-meadow"
                          : c.status === "scheduled"
                            ? "bg-wheat/25 text-ink"
                            : c.status === "ended"
                              ? "bg-stone/20 text-stone"
                              : "bg-paper-dark text-ink-soft"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft font-light">{c.product_ids.length}</td>
                  <td className="px-4 py-3 text-ink-soft font-light whitespace-nowrap">
                    {c.starts_at ? new Date(c.starts_at).toLocaleDateString() : "—"} →{" "}
                    {c.ends_at ? new Date(c.ends_at).toLocaleDateString() : "open"}
                  </td>
                  <td className="px-4 py-3 text-ink-soft font-light whitespace-nowrap">
                    {c.social_posted_at ? "Posted" : "Pending"}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/campaigns/${c.id}`} className="text-xs tracking-widest uppercase font-light text-meadow hover:text-meadow-deep">
                      Edit
                    </Link>
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
