import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { FUNNEL_SESSION_COOKIE, getRecommendationByKey } from "@/lib/funnel";
import PlanCards from "@/components/PlanCards";

export const metadata = { title: "Your personalized plan" };

export default async function ResultsPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(FUNNEL_SESSION_COOKIE)?.value;
  if (!sessionId) redirect("/start");

  // Funnel reads are server-side only (no select policy for anon).
  const admin = createAdminClient();
  const { data: responses } = await admin
    .from("funnel_responses")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1);

  const response = responses?.[0];
  if (!response) redirect("/start");

  const recommendation = getRecommendationByKey(
    response.answers?.recommendation,
  );
  const timePerDay =
    response.answers?.time_per_day === "5min"
      ? "5 minutes"
      : response.answers?.time_per_day === "20min"
        ? "20 minutes"
        : "10 minutes";

  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("audience", "adult")
    .eq("is_active", true)
    .order("price_kes", { ascending: true });

  return (
    <div className="mx-auto w-full max-w-md px-5 py-8">
      <p className="text-sm font-medium text-indigo-600">
        Your personalized plan
      </p>
      <h1 className="mt-1 text-2xl font-bold text-zinc-900">
        {recommendation.title}
      </h1>
      <p className="mt-2 text-zinc-600">{recommendation.pitch}</p>

      <div className="mt-5 rounded-2xl bg-indigo-50 p-5">
        <p className="text-sm font-semibold text-indigo-900">
          With {timePerDay} a day, in your first 2 weeks you can:
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-indigo-800">
          {recommendation.outcomes.map((o) => (
            <li key={o}>✓ {o}</li>
          ))}
        </ul>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-zinc-900">
        Start today. Pick your plan.
      </h2>
      <p className="mb-4 mt-1 text-sm text-zinc-500">
        Pay with M-Pesa. Cancel anytime by simply not renewing.
      </p>
      <PlanCards plans={plans ?? []} highlightSlug="adult-monthly" />
    </div>
  );
}
