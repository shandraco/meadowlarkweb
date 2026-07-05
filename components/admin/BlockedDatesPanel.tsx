"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BlockedDate } from "@/lib/types";
import { addBlockedDate, removeBlockedDate } from "@/app/admin/resources/actions";

export default function BlockedDatesPanel({ resourceId, blocked }: { resourceId: string; blocked: BlockedDate[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [reason, setReason] = useState("");

  function add() {
    if (!startsAt || !endsAt) {
      setError("Pick start and end.");
      return;
    }
    setError(null);
    start(async () => {
      const res = await addBlockedDate({
        resourceId,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        reason,
      });
      if (!res.ok) return setError(res.error ?? "Failed.");
      setStartsAt("");
      setEndsAt("");
      setReason("");
      router.refresh();
    });
  }

  function remove(id: string) {
    start(async () => {
      await removeBlockedDate(id);
      router.refresh();
    });
  }

  const input =
    "w-full border border-meadow/20 bg-paper text-ink placeholder:text-ink-soft/40 px-3 py-2.5 text-sm font-light outline-none focus:border-meadow";

  return (
    <div className="space-y-6">
      <div>
        <p className="section-label mb-3">Block a date</p>
        <div className="space-y-3">
          <input
            type="datetime-local"
            className={input}
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
          <input type="datetime-local" className={input} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          <input className={input} placeholder="Reason (private event, maintenance…)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button onClick={add} disabled={pending} className="btn-primary w-full disabled:opacity-50">
            Add block
          </button>
          {error && <p className="text-sm text-sunset font-light">{error}</p>}
        </div>
      </div>

      <div>
        <p className="section-label mb-3">Existing blocks</p>
        {blocked.length === 0 ? (
          <p className="text-ink-soft/60 font-light text-sm">No blocks.</p>
        ) : (
          <div className="border border-meadow/10 divide-y divide-meadow/10">
            {blocked.map((b) => (
              <div key={b.id} className="px-4 py-3 flex justify-between items-start gap-4 text-sm">
                <div>
                  <p className="text-ink">
                    {new Date(b.starts_at).toLocaleString()} → {new Date(b.ends_at).toLocaleString()}
                  </p>
                  {b.reason && <p className="text-xs text-ink-soft font-light">{b.reason}</p>}
                </div>
                <button
                  onClick={() => remove(b.id)}
                  disabled={pending}
                  className="text-xs tracking-widest uppercase font-light text-stone hover:text-sunset"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
