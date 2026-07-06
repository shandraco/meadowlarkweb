import EventEditor from "@/components/admin/EventEditor";

export const metadata = { title: "New Event | Meadowlark Admin" };

export default function NewEventPage() {
  return (
    <div>
      <p className="section-label mb-2">New</p>
      <h1 className="font-serif text-4xl text-meadow mb-8">Add event</h1>
      <EventEditor />
    </div>
  );
}
