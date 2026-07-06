"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Vendor } from "@/lib/types";
import { createVendor, updateVendor, setVendorActive } from "@/app/admin/vendors/actions";

export default function VendorEditor({ vendor }: { vendor?: Vendor }) {
  const router = useRouter();
  const editing = !!vendor;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [f, setF] = useState({
    name: vendor?.name ?? "",
    contactName: vendor?.contact_name ?? "",
    contactEmail: vendor?.contact_email ?? "",
    contactPhone: vendor?.contact_phone ?? "",
    splitPct: String(vendor?.split_pct ?? 70),
    notes: vendor?.notes ?? "",
  });
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      name: f.name,
      contactName: f.contactName,
      contactEmail: f.contactEmail,
      contactPhone: f.contactPhone,
      splitPct: parseFloat(f.splitPct) || 0,
      notes: f.notes,
    };
    start(async () => {
      const res = editing ? await updateVendor({ id: vendor!.id, ...input }) : await createVendor(input);
      if (!res.ok) return setError(res.error ?? "Save failed.");
      if (editing) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
        router.refresh();
      } else {
        router.push("/admin/vendors");
      }
    });
  }

  const label = "block text-xs tracking-widest uppercase font-light text-stone mb-2";
  const input =
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow transition-colors";

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div>
        <label className={label}>Vendor name</label>
        <input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Papin Farm, Ricci Honey…" required />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={label}>Contact name</label>
          <input className={input} value={f.contactName} onChange={(e) => set("contactName", e.target.value)} />
        </div>
        <div>
          <label className={label}>Phone</label>
          <input className={input} value={f.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Email</label>
          <input className={input} type="email" value={f.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
        </div>
      </div>

      <div>
        <label className={label}>Vendor split (%)</label>
        <input
          className={`${input} max-w-[140px]`}
          inputMode="decimal"
          value={f.splitPct}
          onChange={(e) => set("splitPct", e.target.value)}
          placeholder="70"
        />
        <p className="text-xs text-ink-soft/60 font-light mt-2">Percentage of each sale we owe the vendor.</p>
      </div>

      <div>
        <label className={label}>Notes</label>
        <textarea className={input} rows={4} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Delivery days, terms, address…" />
      </div>

      {error && <p className="text-sm text-sunset font-light">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? "Saving…" : saved ? "Saved ✓" : editing ? "Save changes" : "Create vendor"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() =>
              start(async () => {
                await setVendorActive({ id: vendor!.id, active: !vendor!.active });
                router.refresh();
              })
            }
            className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors"
          >
            {vendor!.active ? "Deactivate" : "Re-activate"}
          </button>
        )}
        <Link href="/admin/vendors" className="text-xs tracking-widest uppercase font-light text-stone hover:text-meadow transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
