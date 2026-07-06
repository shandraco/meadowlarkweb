import { getActiveProducts, getPosCategories } from "@/lib/products";
import { getSessionProfile } from "@/lib/auth";
import { getPosLocationId, getActiveLocations, getLocationById } from "@/lib/pos-session";
import PosRegister from "@/components/pos/PosRegister";
import LocationPicker from "@/components/pos/LocationPicker";

export const dynamic = "force-dynamic";
export const metadata = { title: "POS | Meadowlark Farm" };

export default async function PosPage() {
  const [products, categories, session, currentLocationId, locations] = await Promise.all([
    getActiveProducts(),
    getPosCategories(),
    getSessionProfile(),
    getPosLocationId(),
    getActiveLocations(),
  ]);

  if (!currentLocationId) {
    return <LocationPicker locations={locations} />;
  }

  const location = await getLocationById(currentLocationId);

  return (
    <PosRegister
      products={products}
      categories={categories}
      canEdit={session?.profile?.role === "admin"}
      locationName={location?.name ?? "Unknown location"}
      cashierName={session?.profile?.full_name ?? session?.email ?? "Cashier"}
    />
  );
}
