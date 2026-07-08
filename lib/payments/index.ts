import "server-only";
import type { PaymentProvider } from "./provider";
import { stubProvider } from "./stub";

// Swap point for Pesapal: when PESAPAL_CONSUMER_KEY lands in the env,
// return the Pesapal implementation here. Nothing else changes.
export function getPaymentProvider(): PaymentProvider {
  return stubProvider;
}

export function isStubProvider(): boolean {
  return getPaymentProvider().name === "stub";
}
