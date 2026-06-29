"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

// Small cart link with a live item count. Safe before hydration (renders 0).
export default function CartIndicator({ className = "" }: { className?: string }) {
  const { count, hydrated } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className={`relative inline-flex items-center ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L21 7H6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="20" r="1.3" fill="currentColor" />
        <circle cx="18" cy="20" r="1.3" fill="currentColor" />
      </svg>
      {hydrated && count > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-maroon text-cream text-[10px] font-sans font-medium leading-none">
          {count}
        </span>
      )}
    </Link>
  );
}
