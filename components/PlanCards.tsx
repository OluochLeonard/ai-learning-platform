import Link from "next/link";
import { formatKes, type Plan } from "@/types/db";

function renewalCopy(plan: Plan): string {
  if (plan.interval === "one_off") {
    return `One payment. Access for ${plan.duration_days} days. No renewal.`;
  }
  const period = plan.interval === "biweekly" ? "2 weeks" : "month";
  return `${formatKes(plan.price_kes)} per ${period}. You renew manually with M-Pesa. No auto-charge, no surprises.`;
}

export default function PlanCards({
  plans,
  highlightSlug,
}: {
  plans: Plan[];
  highlightSlug?: string;
}) {
  return (
    <div className="space-y-4">
      {plans.map((plan) => {
        const highlighted = plan.slug === highlightSlug;
        return (
          <div
            key={plan.id}
            className={`relative rounded-2xl border bg-white p-5 ${
              highlighted
                ? "border-indigo-600 shadow-md ring-1 ring-indigo-600"
                : "border-zinc-200"
            }`}
          >
            {highlighted && (
              <span className="absolute -top-3 left-4 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                Most popular
              </span>
            )}
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-semibold text-zinc-900">
                {plan.title}
              </h3>
              <p className="text-xl font-bold text-zinc-900">
                {formatKes(plan.price_kes)}
              </p>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-zinc-600">
              <li>✓ All lessons and practice exercises</li>
              <li>✓ Streaks, progress and certificates</li>
              {plan.max_child_profiles > 0 && (
                <li>✓ Up to {plan.max_child_profiles} child profiles included</li>
              )}
              <li>✓ Works on any phone</li>
            </ul>
            <p className="mt-3 text-xs text-zinc-500">{renewalCopy(plan)}</p>
            <Link
              href={`/checkout/${plan.slug}`}
              className={`mt-4 block rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                highlighted
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "border border-zinc-300 text-zinc-800 hover:bg-zinc-50"
              }`}
            >
              Choose {plan.title}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
