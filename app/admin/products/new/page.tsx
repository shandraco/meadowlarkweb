import Link from "next/link";
import ProductEditor from "@/components/admin/ProductEditor";
import { getVendors } from "@/lib/vendors";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const vendors = await getVendors();
  return (
    <div>
      <Link
        href="/admin/products"
        className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors"
      >
        ← Products
      </Link>
      <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none mt-4 mb-10">Add product</h1>
      <ProductEditor vendors={vendors} />
    </div>
  );
}
