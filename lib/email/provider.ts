import type { EmailProvider } from "./types";
import { ResendProvider } from "./resend";

let cached: EmailProvider | null = null;

// Lazy factory — never throws unless email is actually attempted. That lets
// the rest of the app run in local dev without RESEND_API_KEY set.
export function getEmailProvider(): EmailProvider | null {
  if (cached) return cached;
  const name = (process.env.EMAIL_PROVIDER ?? "resend").toLowerCase();
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return null;
  }
  switch (name) {
    case "resend":
      cached = new ResendProvider();
      return cached;
    default:
      console.error(`[email] unknown provider: ${name}`);
      return null;
  }
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
}
