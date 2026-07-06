// Plain HTML string templates. Keeps deps minimal (no react-email pulling in
// its own render pipeline). Every template uses the same wrapper so the
// footer, colors, and address block stay consistent.

import { formatUSD } from "../money";

const BRAND = {
  meadow: "#1F3A5C",
  sunflower: "#D9A621",
  cider: "#8B1E20",
  wheat: "#F4EAD1",
  ink: "#1B2A3D",
  stone: "#7C6E5B",
};

const ADDRESS_HTML = `
  <p style="margin:0;color:${BRAND.stone};font-size:12px;line-height:1.7">
    Meadowlark Farm · 11249 SW 160th St · Rose Hill, KS 67133<br/>
    Text: (316) 518-8907 · gina@themeadowlarkfarm.com
  </p>
`;

function baseWrapper(inner: string, preheader = ""): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Meadowlark Farm</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.wheat};font-family:Georgia,'Times New Roman',serif;color:${BRAND.ink}">
  ${preheader ? `<div style="display:none;font-size:1px;color:${BRAND.wheat};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">${escapeHtml(preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.wheat};padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#fff;border:1px solid rgba(31,58,92,0.12);max-width:600px">
          <tr>
            <td style="background:${BRAND.meadow};padding:28px 32px">
              <p style="margin:0;color:${BRAND.sunflower};font-size:11px;letter-spacing:0.25em;text-transform:uppercase">Meadowlark Farm</p>
              <p style="margin:6px 0 0;color:${BRAND.wheat};font-size:22px">Orchard &amp; Cidery · Rose Hill, KS</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px">
              ${inner}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:${BRAND.wheat};border-top:1px solid rgba(31,58,92,0.10)">
              ${ADDRESS_HTML}
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;color:${BRAND.stone};font-size:11px">Every apple pressed at Meadowlark was grown on this land.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Order confirmation ──────────────────────────────────────────────────
export interface OrderConfirmationData {
  orderNumber: number;
  customerName: string;
  totalCents: number;
  items: { name: string; quantity: number; lineCents: number }[];
  fulfillment: "pickup" | "ship";
  address?: string | null;
  lookupUrl: string;
}

export function renderOrderConfirmation(d: OrderConfirmationData): { subject: string; html: string; text: string } {
  const subject = `Order #${d.orderNumber} — thanks, ${d.customerName.split(" ")[0]}`;
  const itemsRows = d.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;color:${BRAND.ink}">${escapeHtml(i.name)} <span style="color:${BRAND.stone}">× ${i.quantity}</span></td><td align="right" style="padding:8px 0;color:${BRAND.meadow}">${formatUSD(i.lineCents)}</td></tr>`,
    )
    .join("");

  const fulfillmentBlock =
    d.fulfillment === "ship"
      ? `<p style="margin:0 0 8px;color:${BRAND.ink};font-size:14px"><strong>Ship to:</strong></p><p style="margin:0;color:${BRAND.ink};font-size:14px;white-space:pre-wrap">${escapeHtml(d.address ?? "")}</p>`
      : `<p style="margin:0;color:${BRAND.ink};font-size:14px"><strong>Pickup at the farm:</strong> Wed–Sun, 10am–5pm. Bring your order # or the receipt link.</p>`;

  const inner = `
    <h1 style="margin:0 0 4px;color:${BRAND.meadow};font-size:26px">Order #${d.orderNumber}</h1>
    <p style="margin:0 0 24px;color:${BRAND.cider};font-size:12px;letter-spacing:0.2em;text-transform:uppercase">Confirmed</p>

    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND.ink}">
      Thanks, ${escapeHtml(d.customerName)}. We&apos;ve got your order and it&apos;s in the queue.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:16px 0 24px">
      ${itemsRows}
      <tr><td colspan="2" style="border-top:1px solid rgba(31,58,92,0.15);padding:12px 0"></td></tr>
      <tr>
        <td style="padding:0;font-size:16px;color:${BRAND.ink}"><strong>Total</strong></td>
        <td align="right" style="padding:0;font-size:18px;color:${BRAND.cider}"><strong>${formatUSD(d.totalCents)}</strong></td>
      </tr>
    </table>

    <div style="background:${BRAND.wheat};padding:18px;border-left:3px solid ${BRAND.sunflower};margin-bottom:24px">
      ${fulfillmentBlock}
    </div>

    <p style="margin:0 0 8px;font-size:13px;color:${BRAND.stone}">Save this link — you can check on your order anytime:</p>
    <p style="margin:0 0 24px">
      <a href="${d.lookupUrl}" style="color:${BRAND.cider};font-size:14px">${d.lookupUrl}</a>
    </p>

    <p style="margin:0;font-size:13px;color:${BRAND.stone};line-height:1.6">
      Questions? Reply to this email or text (316) 518-8907. We&apos;re usually outside.
    </p>
  `;

  const text = [
    `Order #${d.orderNumber} — confirmed`,
    ``,
    `Thanks, ${d.customerName}.`,
    ``,
    ...d.items.map((i) => `  ${i.name} × ${i.quantity} — ${formatUSD(i.lineCents)}`),
    `  Total — ${formatUSD(d.totalCents)}`,
    ``,
    d.fulfillment === "ship" ? `Ship to:\n${d.address}` : `Pickup: Wed–Sun 10–5 at the farm.`,
    ``,
    `View your order: ${d.lookupUrl}`,
    ``,
    `Meadowlark Farm · 11249 SW 160th St · Rose Hill, KS`,
  ].join("\n");

  return { subject, html: baseWrapper(inner, `Order #${d.orderNumber} confirmed — ${formatUSD(d.totalCents)}`), text };
}

// ── Booking confirmation ────────────────────────────────────────────────
export interface BookingConfirmationData {
  bookingNumber: number;
  customerName: string;
  what: string; // "The Barn" or "Apple Juice Program"
  when: string; // human-readable
  guestCount: number;
  totalCents: number;
  depositCents: number;
}

export function renderBookingConfirmation(d: BookingConfirmationData): { subject: string; html: string; text: string } {
  const subject = `Booking request received — ${d.what} on ${d.when}`;
  const inner = `
    <h1 style="margin:0 0 4px;color:${BRAND.meadow};font-size:26px">Booking #${d.bookingNumber}</h1>
    <p style="margin:0 0 24px;color:${BRAND.cider};font-size:12px;letter-spacing:0.2em;text-transform:uppercase">Request received</p>

    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND.ink}">
      Thanks, ${escapeHtml(d.customerName)}. We&apos;ve got your request. We&apos;ll get back to you within a business day to confirm the date and send an invoice for the deposit.
    </p>

    <div style="background:${BRAND.wheat};padding:20px;margin:0 0 24px">
      <p style="margin:0 0 6px;color:${BRAND.stone};font-size:11px;letter-spacing:0.2em;text-transform:uppercase">What</p>
      <p style="margin:0 0 16px;color:${BRAND.meadow};font-size:20px">${escapeHtml(d.what)}</p>
      <p style="margin:0 0 6px;color:${BRAND.stone};font-size:11px;letter-spacing:0.2em;text-transform:uppercase">When</p>
      <p style="margin:0 0 16px;color:${BRAND.meadow};font-size:16px">${escapeHtml(d.when)}</p>
      <p style="margin:0 0 6px;color:${BRAND.stone};font-size:11px;letter-spacing:0.2em;text-transform:uppercase">Guests</p>
      <p style="margin:0 0 16px;color:${BRAND.meadow};font-size:16px">${d.guestCount}</p>
      <p style="margin:0 0 6px;color:${BRAND.stone};font-size:11px;letter-spacing:0.2em;text-transform:uppercase">Total · Deposit</p>
      <p style="margin:0;color:${BRAND.cider};font-size:20px"><strong>${formatUSD(d.totalCents)}</strong> · deposit ${formatUSD(d.depositCents)}</p>
    </div>

    <p style="margin:0;font-size:13px;color:${BRAND.stone};line-height:1.6">
      Reply to this email with questions, or text (316) 518-8907.
    </p>
  `;
  const text = [
    `Booking #${d.bookingNumber} — request received`,
    ``,
    `Thanks, ${d.customerName}. We'll confirm within a business day.`,
    ``,
    `What: ${d.what}`,
    `When: ${d.when}`,
    `Guests: ${d.guestCount}`,
    `Total: ${formatUSD(d.totalCents)} (deposit ${formatUSD(d.depositCents)})`,
    ``,
    `Meadowlark Farm · Rose Hill, KS`,
  ].join("\n");
  return { subject, html: baseWrapper(inner, `Booking #${d.bookingNumber} received`), text };
}

// ── Cider Club welcome ─────────────────────────────────────────────────
export interface ClubWelcomeData {
  memberNumber: number;
  customerName: string;
  planName: string;
  cadence: string;
  bottlesPerShipment: number;
  fulfillmentMode: "ship" | "pickup";
  memberPortalUrl: string;
}

export function renderClubWelcome(d: ClubWelcomeData): { subject: string; html: string; text: string } {
  const subject = `Welcome to the Cider Club, ${d.customerName.split(" ")[0]}`;
  const inner = `
    <h1 style="margin:0 0 4px;color:${BRAND.meadow};font-size:26px">Member #${d.memberNumber}</h1>
    <p style="margin:0 0 24px;color:${BRAND.sunflower};font-size:12px;letter-spacing:0.2em;text-transform:uppercase">Welcome to the club</p>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${BRAND.ink}">
      Thanks for joining, ${escapeHtml(d.customerName)}. You&apos;re in for <strong>${d.bottlesPerShipment} bottles</strong> per shipment on the <strong>${escapeHtml(d.planName)}</strong> plan, ${escapeHtml(d.cadence)}.
    </p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:${BRAND.ink}">
      Your allocation ships before each release goes public. First shipment goes out with a hand-stamped postcard and a scented insert from the orchard.
    </p>

    <p style="margin:0 0 8px;font-size:13px;color:${BRAND.stone}">Save this link to pause, skip a shipment, update your address, or cancel:</p>
    <p style="margin:0 0 24px">
      <a href="${d.memberPortalUrl}" style="color:${BRAND.cider};font-size:14px">${d.memberPortalUrl}</a>
    </p>

    <p style="margin:0;font-size:13px;color:${BRAND.stone};line-height:1.6">
      ${d.fulfillmentMode === "ship" ? "We'll email you when each shipment is packed and tracked." : "We'll hold your allocation for pickup at the farm — come by any time during our Wed–Sun hours."}
    </p>
  `;
  const text = [
    `Welcome to the Cider Club — Member #${d.memberNumber}`,
    ``,
    `Plan: ${d.planName} (${d.cadence}) — ${d.bottlesPerShipment} bottles/shipment`,
    ``,
    `Manage your membership: ${d.memberPortalUrl}`,
    ``,
    `Meadowlark Farm · Rose Hill, KS`,
  ].join("\n");
  return { subject, html: baseWrapper(inner, `Welcome to the Cider Club — Member #${d.memberNumber}`), text };
}

// ── Season pass confirmation ────────────────────────────────────────────
export interface SeasonPassConfirmationData {
  passNumber: number;
  customerName: string;
  expiresAt: string;
  priceCents: number;
  redeemUrl: string;
}

export function renderSeasonPassConfirmation(d: SeasonPassConfirmationData): { subject: string; html: string; text: string } {
  const subject = `Season Pass #${d.passNumber} — welcome, ${d.customerName.split(" ")[0]}`;
  const expiresLabel = new Date(d.expiresAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const inner = `
    <h1 style="margin:0 0 4px;color:${BRAND.meadow};font-size:26px">Season Pass #${d.passNumber}</h1>
    <p style="margin:0 0 24px;color:${BRAND.cider};font-size:12px;letter-spacing:0.2em;text-transform:uppercase">Active</p>

    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.ink}">
      Thanks, ${escapeHtml(d.customerName)}. Your pass is good for unlimited farm entry through <strong>${escapeHtml(expiresLabel)}</strong>.
    </p>

    <div style="background:${BRAND.wheat};padding:20px;margin:0 0 24px;text-align:center">
      <p style="margin:0 0 8px;color:${BRAND.stone};font-size:11px;letter-spacing:0.2em;text-transform:uppercase">Show at the gate</p>
      <p style="margin:0;color:${BRAND.meadow};font-size:32px;letter-spacing:0.1em">#${d.passNumber}</p>
    </div>

    <p style="margin:0 0 8px;font-size:13px;color:${BRAND.stone}">Bookmark your pass to show it on your phone:</p>
    <p style="margin:0 0 24px">
      <a href="${d.redeemUrl}" style="color:${BRAND.cider};font-size:14px">${d.redeemUrl}</a>
    </p>

    <p style="margin:0;font-size:13px;color:${BRAND.stone};line-height:1.6">
      We&apos;ll invoice you for ${formatUSD(d.priceCents)} within a business day. Questions? Reply to this email.
    </p>
  `;
  const text = [
    `Season Pass #${d.passNumber} — active through ${expiresLabel}`,
    ``,
    `Thanks, ${d.customerName}.`,
    ``,
    `Save this URL to show at the gate: ${d.redeemUrl}`,
    ``,
    `Meadowlark Farm · Rose Hill, KS`,
  ].join("\n");
  return { subject, html: baseWrapper(inner, `Season Pass #${d.passNumber} active`), text };
}

// ── Admin notification (new booking) ────────────────────────────────────
export interface AdminNewBookingData {
  bookingNumber: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  what: string;
  when: string;
  guestCount: number;
  totalCents: number;
  notes: string | null;
  adminUrl: string;
}

export function renderAdminNewBooking(d: AdminNewBookingData): { subject: string; html: string; text: string } {
  const subject = `New booking #${d.bookingNumber} — ${d.what} on ${d.when}`;
  const inner = `
    <h1 style="margin:0 0 4px;color:${BRAND.meadow};font-size:22px">New booking #${d.bookingNumber}</h1>
    <p style="margin:0 0 20px;color:${BRAND.cider};font-size:11px;letter-spacing:0.2em;text-transform:uppercase">Pending your review</p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 0;color:${BRAND.stone}">What</td><td style="padding:8px 0;color:${BRAND.ink}">${escapeHtml(d.what)}</td></tr>
      <tr><td style="padding:8px 0;color:${BRAND.stone}">When</td><td style="padding:8px 0;color:${BRAND.ink}">${escapeHtml(d.when)}</td></tr>
      <tr><td style="padding:8px 0;color:${BRAND.stone}">Guests</td><td style="padding:8px 0;color:${BRAND.ink}">${d.guestCount}</td></tr>
      <tr><td style="padding:8px 0;color:${BRAND.stone}">Total</td><td style="padding:8px 0;color:${BRAND.ink}">${formatUSD(d.totalCents)}</td></tr>
      <tr><td style="padding:8px 0;color:${BRAND.stone}">Customer</td><td style="padding:8px 0;color:${BRAND.ink}">${escapeHtml(d.customerName)}</td></tr>
      <tr><td style="padding:8px 0;color:${BRAND.stone}">Email</td><td style="padding:8px 0;color:${BRAND.ink}">${escapeHtml(d.customerEmail)}</td></tr>
      ${d.customerPhone ? `<tr><td style="padding:8px 0;color:${BRAND.stone}">Phone</td><td style="padding:8px 0;color:${BRAND.ink}">${escapeHtml(d.customerPhone)}</td></tr>` : ""}
      ${d.notes ? `<tr><td style="padding:8px 0;color:${BRAND.stone};vertical-align:top">Notes</td><td style="padding:8px 0;color:${BRAND.ink};white-space:pre-wrap">${escapeHtml(d.notes)}</td></tr>` : ""}
    </table>

    <p style="margin:24px 0 0"><a href="${d.adminUrl}" style="color:${BRAND.cider};font-size:14px">Open in admin →</a></p>
  `;
  const text = [
    `New booking #${d.bookingNumber}`,
    `What: ${d.what}`,
    `When: ${d.when}`,
    `Guests: ${d.guestCount}`,
    `Customer: ${d.customerName} (${d.customerEmail}${d.customerPhone ? `, ${d.customerPhone}` : ""})`,
    d.notes ? `Notes: ${d.notes}` : "",
    ``,
    `Admin: ${d.adminUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
  return { subject, html: baseWrapper(inner), text };
}
