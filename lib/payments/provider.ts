import type { PaymentProvider } from "./types";
import { StripeProvider } from "./stripe";

// Singleton factory. To swap providers, change PAYMENT_PROVIDER in env and
// add a new case here — the checkout flow doesn't change.
let cached: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;
  const name = (process.env.PAYMENT_PROVIDER ?? "stripe").toLowerCase();
  switch (name) {
    case "stripe":
      cached = new StripeProvider();
      return cached;
    default:
      throw new Error(`Unknown payment provider: ${name}`);
  }
}

// Client-safe publishable key so the browser can mount Elements without
// hitting the server for its own configuration.
export function getPublishableKey(): string {
  return getPaymentProvider().publishableKey();
}
