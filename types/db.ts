export type PlanInterval = "biweekly" | "monthly" | "one_off";
export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type Plan = {
  id: string;
  slug: string;
  title: string;
  audience: "adult" | "kids";
  interval: PlanInterval;
  price_kes: string;
  duration_days: number;
  max_child_profiles: number;
  is_active: boolean;
};

export type Subscription = {
  id: string;
  profile_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  subscription_id: string | null;
  profile_id: string;
  provider: string;
  merchant_reference: string | null;
  order_tracking_id: string | null;
  amount_kes: string;
  status: PaymentStatus;
  raw_ipn: unknown;
  created_at: string;
  confirmed_at: string | null;
};

export type FunnelResponse = {
  id: string;
  session_id: string;
  profile_id: string | null;
  answers: Record<string, string>;
  recommended_track: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string;
};

export function formatKes(price: string | number): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  return `KES ${n.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}
