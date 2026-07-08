"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setIncidentStatus, deleteIncident } from "@/app/admin/incidents/actions";
import type { IncidentStatus } from "@/lib/types";

export default function IncidentManage({ id, status }: { id: string; status: IncidentStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  function toggle() {
    setError(null);
    const next: IncidentStatus = status === "open" ? "resolved" : "open";
    start(async () => {
      const res = await setIncidentStatus({ id, status: next });
      if (res.ok) router.refresh();
      else setError(res.error ?? "Could not update.");
    });
  }

  function remove() {
    setError(null);
    start(async () => {
      const res = await deleteIncident({ id });
      if (res.ok) {
        router.push("/admin/incidents");
        router.refresh();
      } else {
        setError(res.error ?? "Could not delete.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button onClick={toggle} className="btn-primary" disabled={pending}>
        {status === "open" ? "Mark resolved" : "Reopen"}
      </button>
      {confirming ? (
        <>
          <span className="text-sm text-ink-soft font-light">Delete permanently?</span>
          <button onClick={remove} className="btn-outline text-xs border-cider text-cider hover:bg-cider hover:text-wheat" disabled={pending}>
            Yes, delete
          </button>
          <button onClick={() => setConfirming(false)} className="text-sm text-stone hover:text-meadow">
            Cancel
          </button>
        </>
      ) : (
        <button onClick={() => setConfirming(true)} className="text-sm text-stone hover:text-cider" disabled={pending}>
          Delete
        </button>
      )}
      {error && <p className="text-cider text-sm w-full">{error}</p>}
    </div>
  );
}
