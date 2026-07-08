import IncidentForm from "@/components/admin/IncidentForm";

export const metadata = { title: "Log Incident | Meadowlark Admin" };

export default function NewIncidentPage() {
  return (
    <div>
      <p className="section-label mb-2">Operations</p>
      <h1 className="font-serif text-4xl text-meadow mb-2">Log a farm incident</h1>
      <p className="text-ink-soft font-light mb-8 max-w-xl">
        Works from a phone in the field — snap a photo and tap “Use my current location” to attach a GPS pin.
      </p>
      <IncidentForm />
    </div>
  );
}
