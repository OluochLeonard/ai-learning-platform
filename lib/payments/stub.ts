import "server-only";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { completePayment } from "./complete";
import type {
  CreatePaymentInput,
  CreatePaymentResult,
  IpnResult,
  PaymentProvider,
} from "./provider";

// Stands in for Pesapal until the client's registration completes.
// Creates real payments/subscriptions rows and drives them through the
// same completion path a real IPN will use.
export const stubProvider: PaymentProvider = {
  name: "stub",

  async createPayment({
    planId,
    profileId,
  }: CreatePaymentInput): Promise<CreatePaymentResult> {
    const admin = createAdminClient();

    const { data: plan } = await admin
      .from("plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single();
    if (!plan) throw new Error("Plan not found or inactive");

    const { data: subscription, error: subError } = await admin
      .from("subscriptions")
      .insert({ profile_id: profileId, plan_id: plan.id, status: "pending" })
      .select()
      .single();
    if (subError || !subscription) {
      throw new Error("Could not create subscription");
    }

    const merchantReference = `PLT-${randomUUID()}`;
    const { data: payment, error: payError } = await admin
      .from("payments")
      .insert({
        subscription_id: subscription.id,
        profile_id: profileId,
        provider: "stub",
        merchant_reference: merchantReference,
        amount_kes: plan.price_kes,
        status: "pending",
      })
      .select()
      .single();
    if (payError || !payment) {
      await admin.from("subscriptions").delete().eq("id", subscription.id);
      throw new Error("Could not create payment");
    }

    return {
      kind: "redirect",
      redirectUrl: `/checkout/pay/${payment.id}`,
      paymentId: payment.id,
    };
  },

  async handleIPN(payload: unknown): Promise<IpnResult> {
    const p = payload as { merchant_reference?: string; status?: string };
    if (!p?.merchant_reference) {
      return { ok: false, error: "missing merchant_reference" };
    }
    if (p.status !== "COMPLETED") {
      return { ok: false, error: "unhandled status" };
    }
    const result = await completePayment(p.merchant_reference, payload);
    return { ok: result.ok, error: result.error };
  },
};
