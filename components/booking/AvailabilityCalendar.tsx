"use client";

import { useMemo, useState } from "react";
import type { DayAvailability } from "@/lib/bookings";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface CalendarDay {
  iso: string;
  date: Date;
  inMonth: boolean;
  status: DayAvailability["status"] | "past" | "future";
  bookingCount: number;
  blockedReasons: string[];
}

export default function AvailabilityCalendar({
  monthKey,
  availability,
  onPick,
  selected,
}: {
  monthKey: string; // YYYY-MM
  availability: DayAvailability[];
  onPick: (iso: string) => void;
  selected?: string | null;
}) {
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date(`${monthKey}-01T00:00:00Z`));

  const grid = useMemo<CalendarDay[]>(() => {
    const first = new Date(Date.UTC(viewMonth.getUTCFullYear(), viewMonth.getUTCMonth(), 1));
    const startDayOfWeek = first.getUTCDay();
    const daysInMonth = new Date(Date.UTC(viewMonth.getUTCFullYear(), viewMonth.getUTCMonth() + 1, 0)).getUTCDate();

    const availByDate = new Map(availability.map((a) => [a.date, a] as const));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const cells: CalendarDay[] = [];
    // Leading blanks so the 1st lands on the right weekday.
    for (let i = 0; i < startDayOfWeek; i++) {
      const d = new Date(first);
      d.setUTCDate(d.getUTCDate() - (startDayOfWeek - i));
      cells.push({
        iso: d.toISOString().slice(0, 10),
        date: d,
        inMonth: false,
        status: "future",
        bookingCount: 0,
        blockedReasons: [],
      });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(Date.UTC(viewMonth.getUTCFullYear(), viewMonth.getUTCMonth(), day));
      const iso = d.toISOString().slice(0, 10);
      const a = availByDate.get(iso);
      const isPast = d < today;
      cells.push({
        iso,
        date: d,
        inMonth: true,
        status: isPast ? "past" : a?.status ?? "open",
        bookingCount: a?.bookingCount ?? 0,
        blockedReasons: a?.blockedReasons ?? [],
      });
    }
    // Trailing blanks to fill the grid.
    while (cells.length % 7 !== 0) {
      const d = new Date(cells[cells.length - 1].date);
      d.setUTCDate(d.getUTCDate() + 1);
      cells.push({
        iso: d.toISOString().slice(0, 10),
        date: d,
        inMonth: false,
        status: "future",
        bookingCount: 0,
        blockedReasons: [],
      });
    }
    return cells;
  }, [viewMonth, availability]);

  function shift(by: number) {
    const next = new Date(viewMonth);
    next.setUTCMonth(next.getUTCMonth() + by);
    setViewMonth(next);
  }

  const cellClass = (day: CalendarDay) => {
    const base =
      "aspect-square flex flex-col items-center justify-center border transition-colors text-sm font-normal select-none";
    if (!day.inMonth) return `${base} border-transparent text-stone/20 pointer-events-none`;
    if (day.status === "past") return `${base} border-meadow/5 text-stone/25 cursor-not-allowed`;
    if (day.status === "booked") return `${base} border-sunset/20 bg-sunset/10 text-sunset cursor-not-allowed`;
    if (day.iso === selected) return `${base} border-meadow bg-meadow text-paper`;
    if (day.status === "partial")
      return `${base} border-wheat/40 bg-wheat/20 text-ink hover:border-meadow cursor-pointer`;
    return `${base} border-meadow/15 text-ink hover:border-meadow hover:bg-meadow/5 cursor-pointer`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => shift(-1)}
          className="text-xs tracking-widest uppercase font-normal text-meadow hover:text-meadow-deep"
        >
          ← Prev
        </button>
        <p className="font-serif text-xl text-ink">
          {MONTH_NAMES[viewMonth.getUTCMonth()]} {viewMonth.getUTCFullYear()}
        </p>
        <button
          onClick={() => shift(1)}
          className="text-xs tracking-widest uppercase font-normal text-meadow hover:text-meadow-deep"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 text-xs tracking-widest uppercase text-stone text-center">
        {DAY_NAMES.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((d) => (
          <button
            key={d.iso}
            className={cellClass(d)}
            disabled={!d.inMonth || d.status === "past" || d.status === "booked"}
            onClick={() => onPick(d.iso)}
            title={d.blockedReasons.join(", ") || undefined}
          >
            <span>{d.date.getUTCDate()}</span>
            {d.inMonth && d.status === "partial" && (
              <span className="text-[9px] tracking-widest uppercase text-ink-soft/80">busy</span>
            )}
            {d.inMonth && d.status === "booked" && (
              <span className="text-[9px] tracking-widest uppercase">booked</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-ink-soft font-normal">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 border border-meadow/30 bg-paper" /> Open
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 border border-wheat/40 bg-wheat/20" /> Other bookings
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 border border-sunset/20 bg-sunset/10" /> Not available
        </span>
      </div>
    </div>
  );
}
