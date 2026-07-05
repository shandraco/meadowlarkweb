import VendorEditor from "@/components/admin/VendorEditor";

export const metadata = { title: "New Vendor | Meadowlark Admin" };

export default function NewVendorPage() {
  return (
    <div>
      <p className="section-label mb-2">New</p>
      <h1 className="font-serif text-4xl text-meadow mb-8">Add vendor</h1>
      <VendorEditor />
    </div>
  );
}
