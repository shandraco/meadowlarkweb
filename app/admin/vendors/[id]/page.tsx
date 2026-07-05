import { notFound } from "next/navigation";
import VendorEditor from "@/components/admin/VendorEditor";
import { getVendorById } from "@/lib/vendors";

export const dynamic = "force-dynamic";

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await getVendorById(id);
  if (!vendor) notFound();

  return (
    <div>
      <p className="section-label mb-2">Vendor</p>
      <h1 className="font-serif text-4xl text-meadow mb-8">{vendor.name}</h1>
      <VendorEditor vendor={vendor} />
    </div>
  );
}
