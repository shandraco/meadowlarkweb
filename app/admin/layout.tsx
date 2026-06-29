import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  const nav = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products & Stock" },
    { href: "/admin/content", label: "Site Content" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream">
      {/* Sidebar */}
      <aside className="md:w-60 md:min-h-screen bg-orchard text-cream/80 flex md:flex-col justify-between">
        <div className="p-6 md:p-8 flex-1">
          <Link href="/admin" className="block mb-10">
            <p className="section-label text-amber mb-1">Meadowlark</p>
            <p className="font-serif text-2xl text-cream leading-none">Admin</p>
          </Link>
          <nav className="hidden md:flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="px-3 py-2 text-sm font-light hover:bg-orchard-light hover:text-cream transition-colors"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/pos"
              className="px-3 py-2 mt-4 text-sm font-light border border-cream/20 hover:bg-cream/10 transition-colors text-center"
            >
              Open POS →
            </Link>
          </nav>
        </div>
        <div className="p-6 md:p-8">
          <p className="text-xs text-cream/40 font-light mb-3 hidden md:block">{session.email}</p>
          <form action={logout}>
            <button className="text-xs tracking-widest uppercase font-light text-cream/60 hover:text-cream transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile nav row */}
      <nav className="md:hidden flex gap-1 bg-orchard-light px-4 py-2 overflow-x-auto">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="px-3 py-1.5 text-xs font-light text-cream/80 whitespace-nowrap">
            {n.label}
          </Link>
        ))}
        <Link href="/pos" className="px-3 py-1.5 text-xs font-light text-amber whitespace-nowrap">POS →</Link>
      </nav>

      <main className="flex-1 p-6 md:p-10 lg:p-14">{children}</main>
    </div>
  );
}
