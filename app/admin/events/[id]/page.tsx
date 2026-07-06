import { notFound } from "next/navigation";
import EventEditor from "@/components/admin/EventEditor";
import { getEventById } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  return (
    <div>
      <p className="section-label mb-2">Event</p>
      <h1 className="font-serif text-4xl text-meadow mb-8">{event.name}</h1>
      <EventEditor event={event} />
    </div>
  );
}
