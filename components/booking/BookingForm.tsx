"use client";

import { useState, useTransition } from "react";
import { requestBooking } from "@/app/visit/book/actions";
import type { BookableResource, FieldTripProgram } from "@/lib/types";
import { formatUSD } from "@/lib/money";
import AvailabilityCalendar from "./AvailabilityCalendar";
import type { DayAvailability } from "@/lib/bookings";

interface Props {
  resource?: BookableResource;
  program?: FieldTripProgram;
  monthKey: string;
  availability: DayAvailability[];
}

export default function BookingForm({ resource, program, monthKey, availability }: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ bookingNumber: number; totalCents: number; depositCents: number } | null>(null);

  const [date, setDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("14:00");
  const [guests, setGuests] = useState<string>(program ? String(program.min_students) : "10");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [notes, setNotes] = useState("");

  const input =
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-normal outline-none focus:border-meadow transition-colors";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) {
      setError("Pick a date on the calendar.");
      return;
    }
    setError(null);
    start(async () => {
      const res = await requestBooking({
        resourceId: resource?.id,
        programId: program?.id,
        date,
        startTime,
        endTime,
        guestCount: parseInt(guests, 10) || 1,
        customer: { name, email, phone, organization },
        notes,
      });
      if (res.ok && res.bookingNumber != null) {
        setSuccess({
          bookingNumber: res.bookingNumber,
          totalCents: res.totalCents ?? 0,
          depositCents: res.depositCents ?? 0,
        });
      } else {
        setError(res.error ?? "Could not book.");
      }
    });
  }

  if (success) {
    return (
      <div className="border border-meadow/20 bg-paper-dark/30 p-8 text-center">
        <p className="section-label mb-3">Request received</p>
        <h2 className="font-serif text-3xl text-meadow mb-3">Booking #{success.bookingNumber}</h2>
        <p className="text-ink-soft font-normal mb-4">
          Total: <span className="text-ink">{formatUSD(success.totalCents)}</span> · Deposit:{" "}
          <span className="text-ink">{formatUSD(success.depositCents)}</span>
        </p>
        <p className="text-ink-soft font-normal leading-relaxed">
          We&apos;ll follow up by email to confirm the date and send an invoice for the deposit. Watch your inbox from
          <span className="text-ink"> gina@themeadowlarkfarm.com</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <div>
        <p className="section-label mb-4">Pick a date</p>
        <AvailabilityCalendar monthKey={monthKey} availability={availability} selected={date} onPick={setDate} />
        {date && <p className="text-sm text-ink-soft font-normal mt-3">Selected: <span className="text-ink">{date}</span></p>}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-stone font-normal mb-1">Start time</label>
          <input className={input} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs text-stone font-normal mb-1">End time</label>
          <input className={input} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs text-stone font-normal mb-1">{program ? "Students" : "Guests"}</label>
          <input className={input} inputMode="numeric" value={guests} onChange={(e) => setGuests(e.target.value)} required />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-stone font-normal mb-1">Your name</label>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs text-stone font-normal mb-1">Email</label>
          <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs text-stone font-normal mb-1">Phone (optional)</label>
          <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-stone font-normal mb-1">{program ? "School / organization" : "Organization (optional)"}</label>
          <input className={input} value={organization} onChange={(e) => setOrganization(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-stone font-normal mb-1">Notes for us</label>
        <textarea
          className={input}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Dietary restrictions, accessibility needs, special asks…"
        />
      </div>

      {error && <p className="text-sm text-sunset font-normal">{error}</p>}

      <button type="submit" disabled={pending || !date} className="btn-primary disabled:opacity-50">
        {pending ? "Requesting…" : "Request Booking"}
      </button>
      <p className="text-xs text-ink-soft font-normal">
        You&apos;ll be invoiced by email for a 25% deposit. Balance is due on the day.
      </p>
    </form>
  );
}
