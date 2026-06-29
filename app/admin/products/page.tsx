import Link from "next/link";
import { getProductsAdmin } from "@/lib/admin-data";
import { formatUSD } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const products = await getProductsAdmin();
  const lowStock = products.filter((p) => p.active && p.stock_quantity <= 6).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
        <div>
          <p className="section-label mb-2">Catalog</p>
          <h1 className="font-serif text-4xl md:text-5xl text-orchard leading-none">Products &amp; Stock</h1>
        </div>
        <Link href="/admin/products/new" className="btn-primary">+ Add product</Link>
      </div>
      <p className="text-stone font-light mb-10">
        Manage every item shown in the store and POS.
        {lowStock > 0 && <span className="text-maroon"> · {lowStock} low on stock</span>}
      </p>

      <div className="border border-orchard/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream-dark/40 text-left">
              {["", "Product", "Tier", "Price", "Stock", "Status"].map((h, i) => (
                <th key={i} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-orchard/10">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-cream-dark/20">
                <td className="px-4 py-2 w-14">
                  <Link href={`/admin/products/${p.id}`} className="block w-10 h-12 bg-cream-dark overflow-hidden">
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="font-serif text-lg text-orchard hover:text-maroon transition-colors">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-stone font-light whitespace-nowrap">{p.tier}</td>
                <td className="px-4 py-3 text-orchard whitespace-nowrap">{formatUSD(p.price_cents)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={p.stock_quantity <= 6 ? "text-maroon" : "text-orchard"}>{p.stock_quantity}</span>
                  {p.active && p.stock_quantity <= 6 && (
                    <span className="ml-2 text-[10px] tracking-widest uppercase text-maroon">low</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${p.active ? "bg-orchard/15 text-orchard" : "bg-stone/20 text-stone"}`}>
                    {p.active ? "Live" : "Hidden"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
