import { getActiveProducts, getPosCategories } from "@/lib/products";
import { getSessionProfile } from "@/lib/auth";
import PosRegister from "@/components/pos/PosRegister";

export const dynamic = "force-dynamic";
export const metadata = { title: "POS | Meadowlark Farm" };

export default async function PosPage() {
  const [products, categories, session] = await Promise.all([
    getActiveProducts(),
    getPosCategories(),
    getSessionProfile(),
  ]);
  return (
    <PosRegister
      products={products}
      categories={categories}
      canEdit={session?.profile?.role === "admin"}
    />
  );
}
