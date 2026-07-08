"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider, isStubProvider } from "@/lib/payments";

// Drives the same server path a real Pesapal IPN will hit, but from the
// stub pay screen's simulate button. Goes away when Pesapal lands.
export async function simulateSuccessfulPayment(paymentId: string) {
  if (!isStubProvider()) redirect("/pricing");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS: users can only read their own payments, so a hit here proves
  // the payment belongs to the signed-in account.
  const { data: payment } = await supabase
    .from("payments")
    .select("id, merchant_reference, status")
    .eq("id", paymentId)
    .single();
  if (!payment || !payment.merchant_reference) redirect("/pricing");

  const provider = getPaymentProvider();
  const result = await provider.handleIPN({
    merchant_reference: payment.merchant_reference,
    status: "COMPLETED",
    simulated: true,
  });

  if (!result.ok) {
    redirect(`/checkout/pay/${paymentId}?error=1`);
  }
  redirect("/welcome");
}
