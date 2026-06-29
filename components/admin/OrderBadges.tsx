import type { OrderChannel, OrderStatus } from "@/lib/types";

export function ChannelBadge({ channel }: { channel: OrderChannel }) {
  const online = channel === "online";
  return (
    <span
      className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${
        online ? "bg-orchard/10 text-orchard" : "bg-maroon/10 text-maroon"
      }`}
    >
      {online ? "Online" : "POS"}
    </span>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber/20 text-bark",
  paid: "bg-orchard/15 text-orchard",
  fulfilled: "bg-orchard text-cream",
  cancelled: "bg-stone/20 text-stone",
  refunded: "bg-maroon/15 text-maroon",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}
