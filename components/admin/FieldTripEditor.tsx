"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FieldTripProgram } from "@/lib/types";
import { createProgram, updateProgram, setProgramActive } from "@/app/admin/field-trips/actions";

const MONTHS = [
  { v: null, label: "Any month" },
  { v: 1, label: "January" },
  { v: 2, label: "February" },
  { v: 3, label: "March" },
  { v: 4, label: "April" },
  { v: 5, label: "May" },
  { v: 6, label: "June" },
  { v: 7, label: "July" },
  { v: 8, label: "August" },
  { v: 9, label: "September" },
  { v: 10, label: "October" },
  { v: 11, label: "November" },
  { v: 12, label: "December" },
];

export default function FieldTripEditor({ program }: { program?: FieldTripProgram }) {
  const router = useRouter();
  const editing = !!program;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState({
    name: program?.name ?? "",
    description: program?.description ?? "",
    price: program ? (program.price_per_student_cents / 100).toFixed(2) : "",
    min: String(program?.min_students ?? 10),
    max: String(program?.max_students ?? 60),
    seasonStart: program?.season_start_month ?? null,
    seasonEnd: program?.season_end_month ?? null,
    schedule: program?.schedule ?? [
      { time: "9:00", activity: "" },
      { time: "10:00", activity: "" },
      { time: "11:00", activity: "" },
    ],
    teacherNotes: program?.teacher_notes ?? "",
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  function setSchedule(i: number, key: "time" | "activity", val: string) {
    setF((p) => ({
      ...p,
      schedule: p.schedule.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)),
    }));
  }
  function addRow() {
    setF((p) => ({ ...p, schedule: [...p.schedule, { time: "", activity: "" }] }));
  }
  function removeRow(i: number) {
    setF((p) => ({ ...p, schedule: p.schedule.filter((_, idx) => idx !== i) }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      name: f.name,
      description: f.description,
      pricePerStudentCents: Math.round(parseFloat(f.price || "0") * 100),
      minStudents: parseInt(f.min, 10) || 10,
      maxStudents: parseInt(f.max, 10) || 60,
      seasonStartMonth: f.seasonStart,
      seasonEndMonth: f.seasonEnd,
      schedule: f.schedule.filter((s) => s.time.trim() && s.activity.trim()),
      teacherNotes: f.teacherNotes,
    };
    start(async () => {
      const res = editing ? await updateProgram(program!.id, input) : await createProgram(input);
      if (!res.ok) return setError(res.error ?? "Save failed.");
      if (editing) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
        router.refresh();
      } else router.push("/admin/field-trips");
    });
  }

  const label = "block text-xs tracking-widest uppercase font-light text-stone mb-2";
  const input =
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow transition-colors";

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div>
        <label className={label}>Program name</label>
        <input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} required />
      </div>

      <div>
        <label className={label}>Description (for teachers)</label>
        <textarea className={input} rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <div>
          <label className={label}>Fee per student</label>
          <input className={input} inputMode="decimal" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="12.00" />
        </div>
        <div>
          <label className={label}>Min students</label>
          <input className={input} inputMode="numeric" value={f.min} onChange={(e) => set("min", e.target.value)} />
        </div>
        <div>
          <label className={label}>Max students</label>
          <input className={input} inputMode="numeric" value={f.max} onChange={(e) => set("max", e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>Season start</label>
          <select className={input} value={String(f.seasonStart ?? "")} onChange={(e) => set("seasonStart", e.target.value ? parseInt(e.target.value, 10) : null)}>
            {MONTHS.map((m) => (
              <option key={m.label} value={m.v ?? ""}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Season end</label>
          <select className={input} value={String(f.seasonEnd ?? "")} onChange={(e) => set("seasonEnd", e.target.value ? parseInt(e.target.value, 10) : null)}>
            {MONTHS.map((m) => (
              <option key={m.label} value={m.v ?? ""}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="section-label mb-3">Sample schedule</p>
        <div className="space-y-2">
          {f.schedule.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={`${input} w-28`}
                placeholder="9:00"
                value={s.time}
                onChange={(e) => setSchedule(i, "time", e.target.value)}
              />
              <input
                className={input}
                placeholder="Tour orchard, apple juice demo…"
                value={s.activity}
                onChange={(e) => setSchedule(i, "activity", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-xs tracking-widest uppercase text-stone hover:text-sunset transition-colors px-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addRow} className="mt-3 text-xs tracking-widest uppercase text-meadow hover:text-meadow-deep transition-colors">
          + Add step
        </button>
      </div>

      <div>
        <label className={label}>Teacher notes (what to bring, waivers, dietary)</label>
        <textarea className={input} rows={4} value={f.teacherNotes} onChange={(e) => set("teacherNotes", e.target.value)} />
      </div>

      {error && <p className="text-sm text-sunset font-light">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? "Saving…" : saved ? "Saved ✓" : editing ? "Save changes" : "Create program"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() =>
              start(async () => {
                await setProgramActive(program!.id, !program!.active);
                router.refresh();
              })
            }
            className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors"
          >
            {program!.active ? "Deactivate" : "Publish"}
          </button>
        )}
        <Link href="/admin/field-trips" className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
