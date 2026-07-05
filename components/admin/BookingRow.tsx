"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Booking, BookingStatus } from "@/lib/types";
import { formatUSD } from "@/lib/money";
import { setBookingStatus } from "@/app/admin/bookings/actions";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-wheat/25 text-ink",
  confirmed: "bg-meadow/15 text-meadow",
  cancelled: "bg-stone/20 text-stone",
  completed: "bg-meadow text-paper",
  no_show: "bg-sunset/15 text-sunset",
};

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled", "no_show"],
  cancelled: [],
  completed: [],
  no_show: [],
};

export default function BookingRow({ booking, resourceName }: { booking: Booking; resourceName: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function move(to: BookingStatus) {
    start(async () => {
      await setBookingStatus(booking.id, to);
      router.refresh();
    });
  }

  return (
    <div className="border border-meadow/10 bg-paper p-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl text-meadow">#{booking.booking_number}</span>
          <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${STATUS_STYLES[booking.status]}`}>
            {booking.status}
          </span>
          <span className="text-xs tracking-widest uppercase text-ink-soft">{resourceName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-serif text-xl text-meadow">{formatUSD(booking.total_cents)}</span>
          <span className="text-xs text-stone/70 font-light">
            {new Date(booking.starts_at).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 mt-3 text-sm">
        <div className="text-ink-soft font-light">
          <p>
            <span className="text-ink">{booking.customer_name}</span>
            {booking.organization && <span className="text-stone/70"> · {booking.organization}</span>}
          </p>
          <p>{booking.customer_email}</p>
          {booking.customer_phone && <p>{booking.customer_phone}</p>}
        </div>
        <div className="text-ink-soft font-light md:text-right">
          <p>
            {booking.guest_count} guests · Deposit {formatUSD(booking.deposit_cents)}
          </p>
          {booking.notes && <p className="mt-1 text-stone/70">{booking.notes}</p>}
        </div>
      </div>

      {TRANSITIONS[booking.status].length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {TRANSITIONS[booking.status].map((t) => (
            <button
              key={t}
              disabled={pending}
              onClick={() => move(t)}
              className="text-xs tracking-widest uppercase font-light border border-meadow px-3 py-1.5 hover:bg-meadow hover:text-paper transition-colors"
            >
              → {t.replace("_", " ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
