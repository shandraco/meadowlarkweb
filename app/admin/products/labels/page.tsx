import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { productScanCode } from "@/lib/products";
import type { Product } from "@/lib/types";
import LabelSheet, { type LabelItem } from "@/components/admin/LabelSheet";

export const dynamic = "force-dynamic";
export const metadata = { title: "Print QR Labels | Meadowlark Admin" };

export default async function LabelsPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; qty?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("name");
  const products = (data ?? []) as Product[];

  const items: LabelItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    priceCents: p.price_cents,
    code: productScanCode(p),
  }));

  const initialQty = sp.qty ? parseInt(sp.qty, 10) : undefined;

  return (
    <div>
      <div className="no-print mb-8">
        <Link
          href="/admin/products"
          className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow"
        >
          ← Products
        </Link>
        <h1 className="font-serif text-4xl text-meadow mt-3">Print QR labels</h1>
        <p className="text-ink-soft font-light mt-2 max-w-xl">
          Generate a sheet of scannable QR labels for a product batch. Print, stick them on cases or bottles, and
          scan at the POS to ring them up.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-ink-soft font-light">No products yet.</p>
      ) : (
        <LabelSheet items={items} initialProductId={sp.productId} initialQty={initialQty} />
      )}
    </div>
  );
}
