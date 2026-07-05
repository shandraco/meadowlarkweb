import ResourceEditor from "@/components/admin/ResourceEditor";

export const metadata = { title: "New Resource | Meadowlark Admin" };

export default function NewResourcePage() {
  return (
    <div>
      <p className="section-label mb-2">New</p>
      <h1 className="font-serif text-4xl text-meadow mb-8">Add bookable resource</h1>
      <ResourceEditor />
    </div>
  );
}
