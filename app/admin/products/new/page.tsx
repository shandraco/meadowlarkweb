import Link from "next/link";
import ProductEditor from "@/components/admin/ProductEditor";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="text-xs tracking-widest uppercase font-light text-stone hover:text-orchard transition-colors">
        ← Products
      </Link>
      <h1 className="font-serif text-4xl md:text-5xl text-orchard leading-none mt-4 mb-10">Add product</h1>
      <ProductEditor />
    </div>
  );
}
