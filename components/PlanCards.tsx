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
            className={`relative rounded-2xl border p-5 ${
              highlighted
                ? "border-indigo-400/50 bg-gradient-to-br from-indigo-500/[0.14] to-violet-500/[0.08] shadow-[0_0_36px_rgba(99,102,241,0.25)]"
                : "glass"
            }`}
          >
            {highlighted && (
              <span className="absolute -top-3 left-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-0.5 text-xs font-semibold text-white shadow-[0_0_16px_rgba(99,102,241,0.5)]">
                Most popular
              </span>
            )}
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-semibold text-white">
                {plan.title}
              </h3>
              <p className="text-xl font-bold text-white">
                {formatKes(plan.price_kes)}
              </p>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-zinc-300">
              <li>
                <span className="text-cyan-300">✓</span> All lessons and
                practice exercises
              </li>
              <li>
                <span className="text-cyan-300">✓</span> Streaks, progress and
                certificates
              </li>
              {plan.max_child_profiles > 0 && (
                <li>
                  <span className="text-cyan-300">✓</span> Up to{" "}
                  {plan.max_child_profiles} child profiles included
                </li>
              )}
              <li>
                <span className="text-cyan-300">✓</span> Works on any phone
              </li>
            </ul>
            <p className="mt-3 text-xs text-zinc-500">{renewalCopy(plan)}</p>
            <Link
              href={`/checkout/${plan.slug}`}
              className={`mt-4 flex w-full ${highlighted ? "btn-primary" : "btn-ghost"}`}
            >
              Choose {plan.title}
            </Link>
          </div>
        );
      })}
    </div>
  );
}