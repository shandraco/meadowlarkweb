import { createClient } from "@/lib/supabase/server";
import LocationsPanel from "@/components/admin/LocationsPanel";
import type { Location } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Locations | Meadowlark Admin" };

export default async function LocationsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("locations").select("*").order("sort_order");
  const locations = (data ?? []) as Location[];

  return (
    <div>
      <p className="section-label mb-2">Registers</p>
      <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none mb-3">Locations</h1>
      <p className="text-ink-soft font-light mb-10 max-w-xl">
        Every place you ring up a sale. The farm plus each farmers market. Cashiers pick one at login.
      </p>
      <LocationsPanel locations={locations} />
    </div>
  );
}
