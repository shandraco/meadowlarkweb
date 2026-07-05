import Link from "next/link";
import { getShipmentQueue } from "@/lib/subscriptions";
import ShipmentQueueRow from "@/components/admin/ShipmentQueueRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shipment Queue | Meadowlark Admin" };

export default async function ShipmentQueuePage() {
  const shipments = await getShipmentQueue();

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="section-label mb-2">Cider Club</p>
          <h1 className="font-serif text-4xl md:text-5xl text-meadow leading-none">Shipment Queue</h1>
          <p className="text-ink-soft font-light mt-2 max-w-xl">
            Everything currently queued or packed. Print this list on shipment day.
          </p>
        </div>
        <Link href="/admin/subscriptions" className="btn-outline">
          ← Members
        </Link>
      </div>

      {shipments.length === 0 ? (
        <p className="text-ink-soft font-light border-t border-meadow/10 pt-6">
          Nothing queued. Schedule shipments from an individual member&apos;s page.
        </p>
      ) : (
        <div className="border border-meadow/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper-dark/40 text-left">
                {["Ship date", "Member", "Contents", "Status", "Tracking", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs tracking-widest uppercase font-light text-stone whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-meadow/10">
              {shipments.map((s) => (
                <ShipmentQueueRow key={s.id} shipment={s} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
