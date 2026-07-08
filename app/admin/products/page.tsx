import Link from "next/link";
import { getProductsAdmin } from "@/lib/admin-data";
import { formatUSD } from "@/lib/money";
import { effectivePriceCents, isOnSale } from "@/lib/types";
import { getVendors } from "@/lib/vendors";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const [products, vendors] = await Promise.all([getProductsAdmin(), getVendors()]);
  const vendorName = new Map(vendors.map((v) => [v.id, v.name]));
  const lowStock = products.filter((p) => p.active && p.stock_quantity <= 6).length;
  const onSale = products.filter((p) => p.active && isOnSale(p)).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
        <div>
          <p className="section-label mb-2">Catalog</p>
          <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none">Products &amp; Stock</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products/labels" className="btn-outline text-xs">
            Print QR labels
          </Link>
          <Link href="/admin/products/new" className="btn-primary">
            + Add product
          </Link>
        </div>
      </div>
      <p className="text-ink-soft font-light mb-10">
        Manage every item shown in the store and POS.
        {lowStock > 0 && <span className="text-sunset"> · {lowStock} low on stock</span>}
        {onSale > 0 && <span className="text-meadow"> · {onSale} on sale</span>}
      </p>

      <div className="border border-meadow/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-paper-dark/40 text-left">
              {["", "Product", "Tier", "Vendor", "Price", "Stock", "Status", ""].map((h, i) => (
                <th key={i} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-meadow/10">
            {products.map((p) => {
              const sale = isOnSale(p);
              const priceNow = effectivePriceCents(p);
              return (
                <tr key={p.id} className="hover:bg-paper-dark/20">
                  <td className="px-4 py-2 w-14">
                    <Link href={`/admin/products/${p.id}`} className="block w-10 h-12 bg-paper-dark overflow-hidden">
                      {p.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-serif text-lg text-ink hover:text-meadow transition-colors"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft font-light whitespace-nowrap">{p.tier}</td>
                  <td className="px-4 py-3 text-ink-soft font-light whitespace-nowrap">
                    {p.vendor_id ? vendorName.get(p.vendor_id) ?? "—" : <span className="text-stone/50">Farm</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {sale ? (
                      <>
                        <span className="text-sunset">{formatUSD(priceNow)}</span>
                        <span className="ml-2 text-stone/60 line-through text-xs">{formatUSD(p.price_cents)}</span>
                      </>
                    ) : (
                      <span className="text-meadow">{formatUSD(p.price_cents)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={p.stock_quantity <= 6 ? "text-sunset" : "text-meadow"}>{p.stock_quantity}</span>
                    {p.active && p.stock_quantity <= 6 && (
                      <span className="ml-2 text-[10px] tracking-widest uppercase text-sunset">low</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${
                        p.active ? "bg-meadow/15 text-meadow" : "bg-stone/20 text-stone"
                      }`}
                    >
                      {p.active ? "Live" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/products/labels?productId=${p.id}`}
                      className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors mr-4"
                    >
                      Labels
                    </Link>
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-xs tracking-widest uppercase font-light text-meadow hover:text-meadow-deep transition-colors"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
