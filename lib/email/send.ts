// High-level send helpers — one per email kind. These wrap the provider,
// record every attempt in email_log, and never throw. Callers get a boolean.

import { getSupabaseAdmin } from "../supabase/admin";
import { getEmailProvider, isEmailConfigured } from "./provider";
import type { OutboundEmail } from "./types";
import {
  renderAdminNewBooking,
  renderBookingConfirmation,
  renderClubWelcome,
  renderOrderConfirmation,
  type AdminNewBookingData,
  type BookingConfirmationData,
  type ClubWelcomeData,
  type OrderConfirmationData,
} from "./templates";

type EmailKind =
  | "order_confirmation"
  | "booking_confirmation"
  | "booking_status_change"
  | "club_welcome"
  | "shipment_shipped"
  | "season_blast"
  | "admin_new_booking"
  | "admin_new_order"
  | "other";

async function logEmail(input: {
  recipient: string;
  kind: EmailKind;
  status: "sent" | "failed" | "skipped";
  subject?: string;
  providerRef?: string | null;
  entityType?: string;
  entityId?: string;
  error?: string;
}): Promise<void> {
  try {
    const admin = getSupabaseAdmin();
    await admin.from("email_log").insert({
      recipient: input.recipient,
      kind: input.kind,
      status: input.status,
      subject: input.subject ?? null,
      provider: isEmailConfigured() ? "resend" : null,
      provider_ref: input.providerRef ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      error: input.error ?? null,
    });
  } catch (e) {
    // A failed log entry must not roll back the send. Note it and move on.
    console.error("[email] log write failed:", e);
  }
}

async function dispatch(
  kind: EmailKind,
  outbound: OutboundEmail,
  entity?: { type: string; id?: string },
): Promise<boolean> {
  const provider = getEmailProvider();
  if (!provider) {
    console.info(`[email] skipped ${kind} → ${outbound.to} — provider not configured`);
    await logEmail({
      recipient: outbound.to,
      kind,
      status: "skipped",
      subject: outbound.subject,
      entityType: entity?.type,
      entityId: entity?.id,
      error: "EMAIL provider not configured",
    });
    return false;
  }
  const result = await provider.send(outbound);
  await logEmail({
    recipient: outbound.to,
    kind,
    status: result.ok ? "sent" : "failed",
    subject: outbound.subject,
    providerRef: result.providerRef,
    entityType: entity?.type,
    entityId: entity?.id,
    error: result.ok ? undefined : result.error,
  });
  return result.ok;
}

// ── Public API ───────────────────────────────────────────────────────────

export async function sendOrderConfirmation(
  to: string,
  data: OrderConfirmationData,
): Promise<boolean> {
  const { subject, html, text } = renderOrderConfirmation(data);
  return dispatch(
    "order_confirmation",
    { to, subject, html, text, tags: { kind: "order_confirmation" } },
    { type: "order", id: String(data.orderNumber) },
  );
}

export async function sendBookingConfirmation(
  to: string,
  data: BookingConfirmationData,
): Promise<boolean> {
  const { subject, html, text } = renderBookingConfirmation(data);
  return dispatch(
    "booking_confirmation",
    { to, subject, html, text, tags: { kind: "booking_confirmation" } },
    { type: "booking", id: String(data.bookingNumber) },
  );
}

export async function sendClubWelcome(
  to: string,
  data: ClubWelcomeData,
): Promise<boolean> {
  const { subject, html, text } = renderClubWelcome(data);
  return dispatch(
    "club_welcome",
    { to, subject, html, text, tags: { kind: "club_welcome" } },
    { type: "subscription", id: String(data.memberNumber) },
  );
}

export async function sendAdminNewBooking(
  to: string,
  data: AdminNewBookingData,
): Promise<boolean> {
  const { subject, html, text } = renderAdminNewBooking(data);
  return dispatch(
    "admin_new_booking",
    { to, subject, html, text, tags: { kind: "admin_new_booking" } },
    { type: "booking", id: String(data.bookingNumber) },
  );
}
