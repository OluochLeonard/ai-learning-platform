// Provider-agnostic payment contract. Pesapal implements this same
// interface later; nothing outside lib/payments should care which
// provider is live.

export type CreatePaymentInput = {
  planId: string;
  profileId: string;
};

export type CreatePaymentResult =
  | { kind: "redirect"; redirectUrl: string; paymentId: string }
  | { kind: "stk"; paymentId: string; message: string };

export type IpnResult = {
  ok: boolean;
  paymentId?: string;
  error?: string;
};

export interface PaymentProvider {
  name: string;
  // Creates the pending payment (and pending subscription) and returns
  // where to send the user next.
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  // Handles the provider's server-to-server confirmation callback.
  handleIPN(payload: unknown): Promise<IpnResult>;
}
