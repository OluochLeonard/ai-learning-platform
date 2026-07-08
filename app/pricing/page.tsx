import { createClient } from "@/lib/supabase/server";
import PlanCards from "@/components/PlanCards";

export const metadata = { title: "Plans and pricing" };

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("price_kes", { ascending: true });

  const adultPlans = (plans ?? []).filter((p) => p.audience === "adult");
  const kidsPlans = (plans ?? []).filter((p) => p.audience === "kids");

  return (
    <div className="mx-auto w-full max-w-md px-5 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">Plans and pricing</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500">
        Pay with M-Pesa. No auto-charges: you renew when you choose.
      </p>
      <PlanCards plans={adultPlans} highlightSlug="adult-monthly" />
      {kidsPlans.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-semibold text-zinc-900">
            For your kids
          </h2>
          <p className="mb-4 mt-1 text-sm text-zinc-500">
            Guided, safe AI learning for ages 8 to 17.
          </p>
          <PlanCards plans={kidsPlans} />
        </>
      )}
    </div>
  );
}
