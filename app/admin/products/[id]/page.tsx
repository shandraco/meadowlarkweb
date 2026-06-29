import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, getStockMovements } from "@/lib/admin-data";
import { formatUSD } from "@/lib/money";
import ProductEditor from "@/components/admin/ProductEditor";
import StockPanel from "@/components/admin/StockPanel";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, movements] = await Promise.all([getProductById(id), getStockMovements(id)]);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-xs tracking-widest uppercase font-light text-stone hover:text-orchard transition-colors">
        ← Products
      </Link>
      <div className="flex items-baseline gap-4 mt-4 mb-10">
        <h1 className="font-serif text-4xl md:text-5xl text-orchard leading-none">{product.name}</h1>
        <span className="text-stone font-light">{formatUSD(product.price_cents)}</span>
      </div>

      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <p className="section-label mb-5">Details</p>
          <ProductEditor product={product} />
        </div>
        <div className="lg:col-span-2">
          <StockPanel product={product} movements={movements} />
        </div>
      </div>
    </div>
  );
}
