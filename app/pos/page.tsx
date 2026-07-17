import { getActiveProducts, getPosCategories } from "@/lib/products";
import { getSessionProfile } from "@/lib/auth";
import { getPosLocationId, getActiveLocations, getLocationById } from "@/lib/pos-session";
import PosRegister from "@/components/pos/PosRegister";
import LocationPicker from "@/components/pos/LocationPicker";

export const dynamic = "force-dynamic";
export const metadata = { title: "POS | Meadowlark Farm" };

export default async function PosPage() {
  try {
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
  } catch (e) {
    // The POS is a staff-only screen, so surfacing the real failure here is
    // safe and turns an opaque "server error" into something diagnosable. The
    // full error is also logged to the Vercel function logs.
    console.error("[POS] failed to load:", e);
    const message = e instanceof Error ? e.message : String(e);
    return (
      <div className="min-h-screen bg-wheat flex items-center justify-center p-6">
        <div className="max-w-lg border border-cider/30 bg-paper p-8">
          <p className="section-label mb-2">POS unavailable</p>
          <h1 className="font-serif text-2xl text-meadow mb-4">Couldn&apos;t load the register</h1>
          <p className="text-ink-soft text-sm mb-4">
            Something the POS needs failed to load — almost always a database or configuration issue
            in this environment, not the register itself.
          </p>
          <p className="text-sm text-cider font-mono break-words">{message}</p>
        </div>
      </div>
    );
  }
}
