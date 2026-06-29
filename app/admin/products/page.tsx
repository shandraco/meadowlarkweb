import { getProductsAdmin } from "@/lib/admin-data";
import ProductRow from "@/components/admin/ProductRow";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const products = await getProductsAdmin();
  const lowStock = products.filter((p) => p.active && p.stock_quantity <= 6).length;

  return (
    <div>
      <p className="section-label mb-2">Catalog</p>
      <h1 className="font-serif text-4xl md:text-5xl text-orchard leading-none mb-3">Products &amp; Stock</h1>
      <p className="text-stone font-light mb-10">
        Edit price, stock, and visibility. Changes apply to the online store and POS instantly.
        {lowStock > 0 && <span className="text-maroon"> · {lowStock} low on stock</span>}
      </p>

      <div className="border border-orchard/10 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-cream-dark/40 text-left">
              {["Product", "Price", "Stock", "Status", ""].map((h, i) => (
                <th key={i} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
