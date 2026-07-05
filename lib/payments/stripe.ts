import Stripe from "stripe";
import type { CreateIntentInput, CreateIntentResult, PaymentProvider, WebhookEvent } from "./types";

// Server-only. Reads STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET from env.
export class StripeProvider implements PaymentProvider {
  readonly name = "stripe";
  private client: Stripe;
  private webhookSecret: string;
  private publishable: string;

  constructor() {
    const secret = process.env.STRIPE_SECRET_KEY;
    const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_SECRET_KEY is not configured.");
    if (!publishable) throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured.");
    this.publishable = publishable;
    this.webhookSecret = webhookSecret ?? "";
    this.client = new Stripe(secret, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });
  }

  publishableKey(): string {
    return this.publishable;
  }

  async createIntent(input: CreateIntentInput): Promise<CreateIntentResult> {
    const intent = await this.client.paymentIntents.create({
      amount: input.amountCents,
      currency: input.currency,
      receipt_email: input.customerEmail ?? undefined,
      automatic_payment_methods: { enabled: true },
      metadata: input.metadata ?? {},
    });
    if (!intent.client_secret) throw new Error("Stripe did not return a client_secret.");
    return { clientSecret: intent.client_secret, providerRef: intent.id };
  }

  async verifyWebhook(rawBody: string, signature: string): Promise<WebhookEvent> {
    if (!this.webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
    const event = this.client.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        return { type: "payment.succeeded", providerRef: pi.id, raw: event };
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        return { type: "payment.failed", providerRef: pi.id, raw: event };
      }
      default:
        return { type: "unknown", providerRef: null, raw: event };
    }
  }
}
