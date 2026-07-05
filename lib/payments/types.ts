// Provider-agnostic payment abstraction. Adding a new processor means writing
// a second implementation of this interface — nothing in the checkout flow
// needs to know whether it's Stripe, Square, or something local.

export interface CreateIntentInput {
  amountCents: number;
  currency: string; // e.g. "usd"
  customerEmail?: string | null;
  metadata?: Record<string, string>;
}

export interface CreateIntentResult {
  // A public-safe token the browser uses to confirm the payment. For Stripe
  // this is the PaymentIntent client_secret. Other providers may use a
  // session id or a hosted checkout URL — the concept is the same.
  clientSecret: string;
  // Server-side reference we store on the order so the webhook can match.
  providerRef: string;
}

export interface WebhookEvent {
  type: "payment.succeeded" | "payment.failed" | "unknown";
  providerRef: string | null;
  raw: unknown;
}

export interface PaymentProvider {
  readonly name: string;
  createIntent(input: CreateIntentInput): Promise<CreateIntentResult>;
  verifyWebhook(rawBody: string, signature: string): Promise<WebhookEvent>;
  publishableKey(): string;
}
