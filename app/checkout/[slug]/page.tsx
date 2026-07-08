import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatKes } from "@/types/db";
import { startCheckout } from "./actions";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/signup?next=/checkout/${slug}`);

  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (!plan) redirect("/pricing");

  const period =
    plan.interval === "one_off"
      ? `${plan.duration_days} days of access`
      : plan.interval === "biweekly"
        ? "2 weeks of access"
        : "1 month of access";

  const checkoutWithPlan = startCheckout.bind(null, plan.id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Almost there</h1>
      <p className="mt-1 text-sm text-zinc-500">Confirm your plan and pay.</p>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-zinc-900">
            {plan.title}
          </h2>
          <p className="text-2xl font-bold text-zinc-900">
            {formatKes(plan.price_kes)}
          </p>
        </div>
        <p className="mt-1 text-sm text-zinc-600">{period}</p>
        {plan.max_child_profiles > 0 && (
          <p className="mt-1 text-sm text-zinc-600">
            Includes up to {plan.max_child_profiles} child profiles
          </p>
        )}
        <p className="mt-3 text-xs text-zinc-500">
          {plan.interval === "one_off"
            ? "One payment, no renewal."
            : "Renews manually. We never charge you automatically."}
        </p>
      </div>

      <form action={checkoutWithPlan} className="mt-6">
        <button
          type="submit"
          className="w-full rounded-xl bg-green-600 px-6 py-4 text-base font-semibold text-white hover:bg-green-500"
        >
          Pay with M-Pesa
        </button>
      </form>
      <p className="mt-3 text-center text-xs text-zinc-400">
        Secured payment. You will get an M-Pesa prompt on your phone.
      </p>
    </div>
  );
}
