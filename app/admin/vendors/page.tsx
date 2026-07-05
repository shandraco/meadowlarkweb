import Link from "next/link";
import { getVendors, getVendorSalesSummary } from "@/lib/vendors";
import { formatUSD } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vendors | Meadowlark Admin" };

export default async function VendorsPage() {
  const [vendors, sales] = await Promise.all([getVendors(), getVendorSalesSummary()]);
  const salesByVendor = new Map(sales.map((s) => [s.vendor_id, s]));

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-label mb-2">Consignment</p>
          <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none">Vendors</h1>
          <p className="text-ink-soft font-light mt-2 max-w-xl">
            Anyone who brings goods to sell on our floor. Payouts are calculated from their split of paid orders.
          </p>
        </div>
        <Link href="/admin/vendors/new" className="btn-primary">
          + Add vendor
        </Link>
      </div>

      {vendors.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6">
          No vendors yet. Add the first when a neighbor drops off produce.
        </p>
      ) : (
        <div className="border border-meadow/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper-dark/40 text-left">
                {["Vendor", "Contact", "Split", "Sold (paid)", "Owed", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-meadow/10">
              {vendors.map((v) => {
                const s = salesByVendor.get(v.id);
                return (
                  <tr key={v.id} className="hover:bg-paper-dark/20">
                    <td className="px-4 py-3 font-serif text-ink">{v.name}</td>
                    <td className="px-4 py-3 text-ink-soft font-light">
                      {v.contact_name || v.contact_email || v.contact_phone || <span className="text-stone/50">—</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-soft font-light">{v.split_pct}%</td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">
                      {s ? formatUSD(s.gross_cents) : formatUSD(0)}
                      <span className="text-stone/60 text-xs font-light"> · {s?.order_count ?? 0} orders</span>
                    </td>
                    <td className="px-4 py-3 text-meadow whitespace-nowrap">
                      {formatUSD(s?.vendor_owed_cents ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] tracking-widest uppercase px-2 py-1 ${
                          v.active ? "bg-meadow/10 text-meadow" : "bg-stone/10 text-stone"
                        }`}
                      >
                        {v.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/vendors/${v.id}`}
                        className="text-xs tracking-widest uppercase font-light text-meadow hover:text-meadow-deep transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
