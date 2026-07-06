"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Subscription, SubscriptionStatus } from "@/lib/types";
import { setSubscriptionStatus } from "@/app/admin/subscriptions/actions";

const OPTIONS: { value: SubscriptionStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
];

export default function SubscriptionStatusControls({ subscription }: { subscription: Subscription }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function change(next: SubscriptionStatus) {
    if (next === subscription.status) return;
    start(async () => {
      await setSubscriptionStatus({ id: subscription.id, status: next });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => change(o.value)}
          disabled={pending || o.value === subscription.status}
          className={`text-left px-3 py-2 text-sm border transition-colors ${
            o.value === subscription.status ? "bg-meadow text-paper border-meadow" : "border-meadow/20 text-ink hover:border-meadow"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
