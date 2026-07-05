import type { OrderChannel, OrderStatus } from "@/lib/types";

export function ChannelBadge({ channel }: { channel: OrderChannel }) {
  const online = channel === "online";
  return (
    <span
      className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${
        online ? "bg-meadow/10 text-meadow" : "bg-wheat/25 text-ink"
      }`}
    >
      {online ? "Online" : "POS"}
    </span>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-wheat/25 text-ink",
  paid: "bg-meadow/15 text-meadow",
  fulfilled: "bg-meadow text-paper",
  cancelled: "bg-stone/20 text-stone",
  refunded: "bg-sunset/15 text-sunset",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 ${STATUS_STYLES[status]}`}>{status}</span>;
}
