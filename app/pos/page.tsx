import { getActiveProducts } from "@/lib/products";
import PosRegister from "@/components/pos/PosRegister";

export const dynamic = "force-dynamic";
export const metadata = { title: "POS | Meadowlark Farm" };

export default async function PosPage() {
  const products = await getActiveProducts();
  return <PosRegister products={products} />;
}
