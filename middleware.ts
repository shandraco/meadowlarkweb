import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Response security headers applied to every request routed through this
// middleware. Framework-agnostic defaults tuned for a financial platform:
//   • HSTS: force HTTPS on every subsequent request for a year.
//   • X-Frame-Options: block clickjacking.
//   • X-Content-Type-Options: block MIME-sniffing tricks.
//   • Referrer-Policy: don't leak paths to third-party sites.
//   • Permissions-Policy: deny access to sensor / camera / mic APIs.
// CSP is intentionally omitted here — Next 16 injects inline scripts for
// hydration and RSC streaming, and a hand-rolled CSP will break the app
// without a nonce plumbing pass. Add later with per-request nonces once
// there's time to test every page.
const SECURITY_HEADERS: Array<[string, string]> = [
  ["Strict-Transport-Security", "max-age=31536000; includeSubDomains"],
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  [
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
  ],
];

function applySecurityHeaders(res: NextResponse): NextResponse {
  for (const [name, value] of SECURITY_HEADERS) res.headers.set(name, value);
  return res;
}

// Refreshes the Supabase auth session on each request and gates the
// staff-only areas (/pos, /admin). Public store + marketing pages are open.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = path.startsWith("/pos") || path.startsWith("/admin");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  // Already signed in but visiting /login → send to admin.
  if (path === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: ["/pos/:path*", "/admin/:path*", "/login"],
};
