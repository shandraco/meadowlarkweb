import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { logout } from "@/app/login/actions";
import { getPosLocationId, getLocationById } from "@/lib/pos-session";
import { switchLocation } from "./actions";

export const dynamic = "force-dynamic";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();
  const isAdmin = session.profile?.role === "admin";
  const locationId = await getPosLocationId();
  const location = locationId ? await getLocationById(locationId) : null;

  return (
    <div className="h-screen flex flex-col bg-meadow-deep">
      <header className="bg-meadow text-paper flex items-center justify-between px-5 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xs tracking-widest uppercase font-light text-wheat">Meadowlark</span>
          <span className="font-serif text-xl text-paper leading-none">POS</span>
          {location && (
            <span className="hidden sm:inline text-xs tracking-widest uppercase font-light text-paper/70 border-l border-paper/20 pl-4">
              {location.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-5">
          <span className="text-xs text-paper/60 font-light hidden md:inline">{session.email}</span>
          {location && (
            <form action={switchLocation}>
              <button className="text-xs tracking-widest uppercase font-light text-paper/70 hover:text-paper transition-colors">
                Switch location
              </button>
            </form>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="text-xs tracking-widest uppercase font-light text-paper/70 hover:text-paper transition-colors"
            >
              Admin
            </Link>
          )}
          <form action={logout}>
            <button className="text-xs tracking-widest uppercase font-light text-paper/70 hover:text-paper transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
