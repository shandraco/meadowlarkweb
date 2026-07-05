import { notFound } from "next/navigation";
import { getCampaignById } from "@/lib/campaigns";
import { getProductsAdmin } from "@/lib/admin-data";
import CampaignEditor from "@/components/admin/CampaignEditor";

export const dynamic = "force-dynamic";

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [campaign, products] = await Promise.all([getCampaignById(id), getProductsAdmin()]);
  if (!campaign) notFound();
  return (
    <div>
      <p className="section-label mb-2">Campaign</p>
      <h1 className="font-serif text-4xl text-meadow mb-8">{campaign.name}</h1>
      <CampaignEditor campaign={campaign} products={products} />
    </div>
  );
}
