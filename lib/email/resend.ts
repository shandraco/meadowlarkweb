import { Resend } from "resend";
import type { EmailProvider, OutboundEmail, SendResult } from "./types";

// Server-only. Reads RESEND_API_KEY + EMAIL_FROM from env.
export class ResendProvider implements EmailProvider {
  readonly name = "resend";
  private client: Resend;
  private from: string;

  constructor() {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!key) throw new Error("RESEND_API_KEY is not configured.");
    if (!from) throw new Error("EMAIL_FROM is not configured.");
    this.client = new Resend(key);
    this.from = from;
  }

  async send(email: OutboundEmail): Promise<SendResult> {
    try {
      const result = await this.client.emails.send({
        from: this.from,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        replyTo: email.replyTo,
        tags: email.tags
          ? Object.entries(email.tags).map(([name, value]) => ({ name, value }))
          : undefined,
      });
      if (result.error) return { ok: false, error: result.error.message };
      return { ok: true, providerRef: result.data?.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Unknown send error." };
    }
  }
}
