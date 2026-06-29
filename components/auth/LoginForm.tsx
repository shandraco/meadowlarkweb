"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type LoginResult } from "@/app/login/actions";
import { LeafMark } from "@/components/Ornament";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginResult, FormData>(login, {});

  const inputCls =
    "w-full border border-orchard/20 bg-cream text-orchard placeholder:text-stone/40 px-4 py-3 text-sm font-light outline-none focus:border-orchard transition-colors";

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <LeafMark className="w-7 h-10 text-maroon mx-auto mb-6" />
          <p className="section-label mb-2">Staff Access</p>
          <h1 className="embossed font-serif text-4xl text-orchard">Meadowlark</h1>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <input className={inputCls} type="email" name="email" placeholder="Email" required autoFocus />
          <input className={inputCls} type="password" name="password" placeholder="Password" required />

          {state.error && <p className="text-sm text-maroon font-light">{state.error}</p>}

          <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <Link
          href="/"
          className="block text-center text-xs tracking-widest uppercase font-light text-stone hover:text-orchard transition-colors mt-8"
        >
          ← Back to site
        </Link>
      </div>
    </section>
  );
}
