import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { logout } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  const isAdmin = session.profile?.role === "admin";

  return (
    <div className="h-screen flex flex-col bg-cream">
      <header className="bg-orchard text-cream flex items-center justify-between px-5 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <span className="section-label text-amber">Meadowlark</span>
          <span className="font-serif text-xl text-cream leading-none">POS</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-xs text-cream/50 font-light hidden sm:inline">{session.email}</span>
          {isAdmin && (
            <Link href="/admin" className="text-xs tracking-widest uppercase font-light text-cream/70 hover:text-cream transition-colors">
              Admin
            </Link>
          )}
          <form action={logout}>
            <button className="text-xs tracking-widest uppercase font-light text-cream/70 hover:text-cream transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
