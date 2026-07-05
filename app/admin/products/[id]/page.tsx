import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, getStockMovements } from "@/lib/admin-data";
import { getVendors } from "@/lib/vendors";
import { formatUSD } from "@/lib/money";
import { effectivePriceCents, isOnSale } from "@/lib/types";
import ProductEditor from "@/components/admin/ProductEditor";
import StockPanel from "@/components/admin/StockPanel";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, movements, vendors] = await Promise.all([
    getProductById(id),
    getStockMovements(id),
    getVendors(),
  ]);
  if (!product) notFound();

  const sale = isOnSale(product);
  const priceNow = effectivePriceCents(product);

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors"
      >
        ← Products
      </Link>
      <div className="flex items-baseline gap-4 mt-4 mb-10 flex-wrap">
        <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none">{product.name}</h1>
        <span className={`font-serif ${sale ? "text-sunset" : "text-ink-soft"}`}>{formatUSD(priceNow)}</span>
        {sale && <span className="text-stone line-through font-light">{formatUSD(product.price_cents)}</span>}
      </div>

      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <p className="section-label mb-5">Details</p>
          <ProductEditor product={product} vendors={vendors} />
        </div>
        <div className="lg:col-span-2">
          <StockPanel product={product} movements={movements} vendors={vendors} />
        </div>
      </div>
    </div>
  );
}
