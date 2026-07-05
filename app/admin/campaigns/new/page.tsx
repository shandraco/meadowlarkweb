import { getProductsAdmin } from "@/lib/admin-data";
import CampaignEditor from "@/components/admin/CampaignEditor";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  const products = await getProductsAdmin();
  return (
    <div>
      <p className="section-label mb-2">New</p>
      <h1 className="font-serif text-4xl text-meadow mb-8">Create campaign</h1>
      <CampaignEditor products={products} />
    </div>
  );
}
