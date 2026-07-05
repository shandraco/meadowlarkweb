import { getShippingProviders } from "@/lib/shipping";
import { vinoShipperAdapter } from "@/lib/shipping";
import ShippingProviderRow from "@/components/admin/ShippingProviderRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shipping | Meadowlark Admin" };

export default async function ShippingAdminPage() {
  const providers = await getShippingProviders();
  const vinoConfigured = vinoShipperAdapter.configured();

  return (
    <div>
      <p className="section-label mb-2">Fulfillment</p>
      <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none mb-3">Shipping providers</h1>
      <p className="text-ink-soft font-light mb-8 max-w-2xl">
        Kansas orders ship direct from the farm. Everywhere else routes through Vino Shipper — for now. Add or reorder
        providers as new carrier contracts come online.
      </p>

      <div className="border border-meadow/15 bg-paper-dark/40 p-5 mb-8">
        <p className="section-label mb-2">Vino Shipper API</p>
        <p className={`text-sm font-light ${vinoConfigured ? "text-meadow" : "text-sunset"}`}>
          {vinoConfigured
            ? "Credentials detected. Order forwarding + product sync are wired."
            : "Not yet configured. Set VINO_SHIPPER_API_KEY and VINO_SHIPPER_BASE_URL in your env. Orders queue locally until then."}
        </p>
      </div>

      <div className="space-y-6">
        {providers.map((p) => (
          <ShippingProviderRow key={p.id} provider={p} />
        ))}
      </div>
    </div>
  );
}
