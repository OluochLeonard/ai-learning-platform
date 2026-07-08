"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";
import { FUNNEL_SESSION_COOKIE } from "@/lib/funnel";

export async function startCheckout(planId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  if (!profile) redirect("/signup");

  // Attribute the funnel response to this profile now that we know who
  // they are. Real IPNs have no cookies, so this can't happen later.
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(FUNNEL_SESSION_COOKIE)?.value;
  if (sessionId) {
    const admin = createAdminClient();
    await admin
      .from("funnel_responses")
      .update({ profile_id: profile.id })
      .eq("session_id", sessionId)
      .is("profile_id", null);
  }

  const provider = getPaymentProvider();
  const result = await provider.createPayment({
    planId,
    profileId: profile.id,
  });

  if (result.kind === "redirect") {
    redirect(result.redirectUrl);
  }
  // stk results (real Pesapal STK push) will render a waiting screen;
  // not reachable with the stub provider.
  redirect(`/checkout/pay/${result.paymentId}`);
}
