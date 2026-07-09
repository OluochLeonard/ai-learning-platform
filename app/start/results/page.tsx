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
      <p className="animate-fade-up text-sm font-semibold uppercase tracking-widest text-cyan-300">
        Your personalized plan
      </p>
      <h1 className="animate-fade-up anim-delay-1 mt-2 text-3xl font-bold tracking-tight text-white">
        {recommendation.title}
      </h1>
      <p className="animate-fade-up anim-delay-2 mt-2 leading-relaxed text-zinc-400">
        {recommendation.pitch}
      </p>

      <div className="animate-fade-up anim-delay-3 relative mt-6 overflow-hidden rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/[0.14] via-violet-500/[0.08] to-transparent p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/25 blur-3xl" />
        <p className="relative text-sm font-semibold text-white">
          With {timePerDay} a day, in your first 2 weeks you can:
        </p>
        <ul className="relative mt-3 space-y-2 text-sm text-zinc-200">
          {recommendation.outcomes.map((o) => (
            <li key={o} className="flex items-start gap-2">
              <span className="mt-0.5 text-cyan-300">✓</span>
              {o}
            </li>
          ))}
        </ul>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-white">
        Start today. Pick your plan.
      </h2>
      <p className="mb-5 mt-1 text-sm text-zinc-500">
        Pay with M-Pesa. Cancel anytime by simply not renewing.
      </p>
      <PlanCards plans={plans ?? []} highlightSlug="adult-monthly" />
    </div>
  );
}