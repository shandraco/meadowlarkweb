import { notFound } from "next/navigation";
import ResourceEditor from "@/components/admin/ResourceEditor";
import { getBookableResourceById, getBlockedDatesForResource } from "@/lib/bookings";
import BlockedDatesPanel from "@/components/admin/BlockedDatesPanel";

export const dynamic = "force-dynamic";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [resource, blocked] = await Promise.all([getBookableResourceById(id), getBlockedDatesForResource(id)]);
  if (!resource) notFound();

  return (
    <div>
      <p className="section-label mb-2">Resource</p>
      <h1 className="font-serif text-4xl text-meadow mb-8">{resource.name}</h1>
      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <ResourceEditor resource={resource} />
        </div>
        <div className="lg:col-span-2">
          <BlockedDatesPanel resourceId={resource.id} blocked={blocked} />
        </div>
      </div>
    </div>
  );
}
