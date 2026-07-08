import { getFarmStatus } from "@/lib/farm-hours";

// Small "Open now / Opens Wed 10am" pill. Server-rendered so the state
// reflects central time regardless of the visitor's device clock.
export default function OpenNowBadge({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const status = getFarmStatus();

  const base =
    "inline-flex items-center gap-2 px-3 py-1.5 text-xs tracking-widest uppercase font-normal";
  const style = status.open
    ? variant === "light"
      ? "bg-orchard text-wheat"
      : "bg-orchard text-wheat"
    : variant === "light"
      ? "bg-stone/30 text-wheat"
      : "bg-wheat-dark text-ink-soft";

  return (
    <span className={`${base} ${style}`}>
      <span
        className={`w-2 h-2 rounded-full ${status.open ? "bg-sunflower" : "bg-stone/50"}`}
        aria-hidden
      />
      {status.open ? (
        <>
          Open now · <span className="font-normal">{status.todayLabel}</span>
        </>
      ) : (
        <>{status.nextOpenLabel ?? "Closed today"}</>
      )}
    </span>
  );
}
