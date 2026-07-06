import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  const groups: { label: string; items: { href: string; label: string }[] }[] = [
    {
      label: "Sales",
      items: [
        { href: "/admin", label: "Overview" },
        { href: "/admin/orders", label: "Orders" },
        { href: "/admin/products", label: "Products & Stock" },
        { href: "/admin/vendors", label: "Vendors" },
        { href: "/admin/locations", label: "POS locations" },
      ],
    },
    {
      label: "Bookings",
      items: [
        { href: "/admin/bookings", label: "Reservations" },
        { href: "/admin/resources", label: "Spaces" },
        { href: "/admin/field-trips", label: "Field trips" },
      ],
    },
    {
      label: "Cider Club",
      items: [
        { href: "/admin/subscriptions", label: "Members" },
        { href: "/admin/subscriptions/plans", label: "Plans" },
        { href: "/admin/subscriptions/shipments", label: "Shipment queue" },
        { href: "/admin/gifts", label: "Gift memberships" },
      ],
    },
    {
      label: "Season passes",
      items: [{ href: "/admin/season-passes", label: "All passes" }],
    },
    {
      label: "Marketing",
      items: [
        { href: "/admin/campaigns", label: "Discount campaigns" },
        { href: "/admin/subscribers", label: "Season reminders" },
        { href: "/admin/events", label: "Events" },
        { href: "/admin/videos", label: "Farm videos" },
        { href: "/admin/content", label: "Site content" },
      ],
    },
    {
      label: "Fulfillment",
      items: [{ href: "/admin/shipping", label: "Shipping providers" }],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper">
      <aside className="md:w-64 md:min-h-screen bg-meadow-deep text-paper/80 flex md:flex-col justify-between">
        <div className="p-6 md:p-8 flex-1">
          <Link href="/admin" className="block mb-8">
            <p className="text-xs tracking-widest uppercase font-light text-wheat mb-1">Meadowlark</p>
            <p className="font-serif text-2xl text-paper leading-none">Admin</p>
          </Link>
          <nav className="hidden md:flex flex-col gap-6">
            {groups.map((g) => (
              <div key={g.label}>
                <p className="text-[10px] tracking-widest uppercase font-light text-wheat mb-2">{g.label}</p>
                <div className="flex flex-col gap-0.5">
                  {g.items.map((n) => (
                    <Link
                      key={n.href}
                      href={n.href}
                      className="px-2 py-1.5 text-sm font-light rounded-sm hover:bg-meadow hover:text-paper transition-colors"
                    >
                      {n.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Link
              href="/pos"
              className="px-3 py-2 mt-4 text-sm font-light border border-paper/20 hover:bg-paper/10 transition-colors text-center"
            >
              Open POS →
            </Link>
          </nav>
        </div>
        <div className="p-6 md:p-8">
          <p className="text-xs text-paper/40 font-light mb-3 hidden md:block">{session.email}</p>
          <form action={logout}>
            <button className="text-xs tracking-widest uppercase font-light text-paper/60 hover:text-paper transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <nav className="md:hidden flex gap-1 bg-meadow px-4 py-2 overflow-x-auto">
        {groups.flatMap((g) => g.items).map((n) => (
          <Link key={n.href} href={n.href} className="px-3 py-1.5 text-xs font-light text-paper/80 whitespace-nowrap">
            {n.label}
          </Link>
        ))}
        <Link href="/pos" className="px-3 py-1.5 text-xs font-light text-wheat whitespace-nowrap">
          POS →
        </Link>
      </nav>

      <main className="flex-1 p-6 md:p-10 lg:p-14">{children}</main>
    </div>
  );
}
