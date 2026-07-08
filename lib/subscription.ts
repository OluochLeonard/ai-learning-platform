import { createClient } from "@/lib/supabase/server";
import type { Plan, Subscription } from "@/types/db";

export type AccessState = {
  hasAccess: boolean;
  expiresAt: Date | null;
  daysLeft: number | null;
  plan: Plan | null;
  subscription: Subscription | null;
};

// Subscriptions always hang off the adult profile. RLS lets the signed-in
// user read their own subscription rows, so the regular server client works.
export async function getAccessState(): Promise<AccessState> {
  const supabase = await createClient();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("status", "active")
    .order("expires_at", { ascending: false })
    .limit(1);

  const sub = subs?.[0];
  if (!sub || !sub.expires_at) {
    return {
      hasAccess: false,
      expiresAt: null,
      daysLeft: null,
      plan: null,
      subscription: null,
    };
  }

  const expiresAt = new Date(sub.expires_at);
  const msLeft = expiresAt.getTime() - Date.now();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const { plans, ...subscription } = sub;

  return {
    hasAccess: msLeft > 0,
    expiresAt,
    daysLeft,
    plan: plans ?? null,
    subscription,
  };
}
