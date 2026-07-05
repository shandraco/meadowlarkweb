import { notFound } from "next/navigation";
import FieldTripEditor from "@/components/admin/FieldTripEditor";
import { getFieldTripProgramById } from "@/lib/bookings";

export const dynamic = "force-dynamic";

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = await getFieldTripProgramById(id);
  if (!program) notFound();

  return (
    <div>
      <p className="section-label mb-2">Program</p>
      <h1 className="font-serif text-4xl text-meadow mb-8">{program.name}</h1>
      <FieldTripEditor program={program} />
    </div>
  );
}
