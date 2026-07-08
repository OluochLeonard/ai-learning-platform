import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// The single server path that turns a confirmed payment into access.
// Called by StubProvider's simulate flow today and by the Pesapal IPN
// handler later. Idempotent: a second call for the same payment no-ops.
export async function completePayment(
  merchantReference: string,
  rawIpn: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();

  const { data: payment } = await admin
    .from("payments")
    .select("*, subscriptions(*, plans(*))")
    .eq("merchant_reference", merchantReference)
    .single();

  if (!payment) return { ok: false, error: "payment not found" };
  if (payment.status === "completed") return { ok: true };
  if (payment.status !== "pending") {
    return { ok: false, error: `payment is ${payment.status}` };
  }

  const pendingSub = payment.subscriptions;
  const plan = pendingSub?.plans;
  if (!pendingSub || !plan) {
    return { ok: false, error: "payment has no subscription/plan" };
  }

  const now = new Date();
  const durationMs = plan.duration_days * 24 * 60 * 60 * 1000;

  // Renewal: if the profile already has a live subscription, extend it
  // from its current expiry instead of starting a parallel one.
  const { data: activeSubs } = await admin
    .from("subscriptions")
    .select("id, expires_at")
    .eq("profile_id", payment.profile_id)
    .eq("status", "active")
    .gt("expires_at", now.toISOString())
    .neq("id", pendingSub.id)
    .order("expires_at", { ascending: false })
    .limit(1);

  let subscriptionId = pendingSub.id;

  if (activeSubs && activeSubs.length > 0) {
    const active = activeSubs[0];
    const newExpiry = new Date(
      new Date(active.expires_at).getTime() + durationMs,
    );
    await admin
      .from("subscriptions")
      .update({ expires_at: newExpiry.toISOString(), plan_id: plan.id })
      .eq("id", active.id);
    subscriptionId = active.id;
    await admin.from("subscriptions").delete().eq("id", pendingSub.id);
  } else {
    await admin
      .from("subscriptions")
      .update({
        status: "active",
        started_at: now.toISOString(),
        expires_at: new Date(now.getTime() + durationMs).toISOString(),
      })
      .eq("id", pendingSub.id);
  }

  await admin
    .from("payments")
    .update({
      status: "completed",
      confirmed_at: now.toISOString(),
      subscription_id: subscriptionId,
      raw_ipn: rawIpn ?? null,
    })
    .eq("id", payment.id);

  return { ok: true };
}
