"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ShipmentStatus, SubscriptionShipment } from "@/lib/types";
import { setShipmentStatus } from "@/app/admin/subscriptions/actions";

interface Row extends SubscriptionShipment {
  customer_name: string;
  customer_email: string;
}

const NEXT_STATUS: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  queued: "packed",
  packed: "shipped",
  shipped: "delivered",
};

export default function ShipmentQueueRow({ shipment }: { shipment: Row }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [tracking, setTracking] = useState(shipment.tracking_number ?? "");

  const nextStatus = NEXT_STATUS[shipment.status];

  function advance() {
    if (!nextStatus) return;
    start(async () => {
      await setShipmentStatus({ id: shipment.id, status: nextStatus, tracking });
      router.refresh();
    });
  }

  return (
    <tr className="hover:bg-paper-dark/20">
      <td className="px-4 py-3 font-serif text-meadow whitespace-nowrap">
        {new Date(shipment.ship_date).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-ink">
        {shipment.customer_name}
        <span className="block text-xs text-ink-soft font-light">{shipment.customer_email}</span>
      </td>
      <td className="px-4 py-3 text-ink-soft font-light">
        {shipment.product_ids.length} bottle{shipment.product_ids.length === 1 ? "" : "s"}
        {shipment.notes && <span className="block text-xs">{shipment.notes}</span>}
      </td>
      <td className="px-4 py-3">
        <span className="text-[10px] tracking-widest uppercase px-2 py-1 bg-wheat/25 text-ink">{shipment.status}</span>
      </td>
      <td className="px-4 py-3">
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Tracking #"
          className="w-32 border border-meadow/20 bg-paper text-ink text-xs px-2 py-1 outline-none focus:border-meadow"
        />
      </td>
      <td className="px-4 py-3">
        {nextStatus && (
          <button
            onClick={advance}
            disabled={pending}
            className="text-xs tracking-widest uppercase font-light border border-meadow px-3 py-1.5 hover:bg-meadow hover:text-paper transition-colors"
          >
            → {nextStatus}
          </button>
        )}
      </td>
    </tr>
  );
}
