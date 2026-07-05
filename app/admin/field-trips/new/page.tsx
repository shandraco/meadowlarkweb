import FieldTripEditor from "@/components/admin/FieldTripEditor";

export const metadata = { title: "New Program | Meadowlark Admin" };

export default function NewProgramPage() {
  return (
    <div>
      <p className="section-label mb-2">New</p>
      <h1 className="font-serif text-4xl text-meadow mb-8">Add field trip program</h1>
      <FieldTripEditor />
    </div>
  );
}
