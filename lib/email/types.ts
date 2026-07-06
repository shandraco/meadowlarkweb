// Provider-agnostic email interface. Swapping vendors (Resend → Postmark →
// SendGrid) means writing another implementation of this interface — the
// send helpers in send.ts and the templates never change.

export interface OutboundEmail {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface SendResult {
  ok: boolean;
  providerRef?: string;
  error?: string;
}

export interface EmailProvider {
  readonly name: string;
  send(email: OutboundEmail): Promise<SendResult>;
}
