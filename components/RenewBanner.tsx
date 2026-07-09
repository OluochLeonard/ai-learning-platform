import Link from "next/link";
import type { AccessState } from "@/lib/subscription";

export default function RenewBanner({ access }: { access: AccessState }) {
  if (access.hasAccess && (access.daysLeft ?? 99) > 3) return null;

  const expired = !access.hasAccess;
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 ${
        expired
          ? "border-rose-400/25 bg-rose-500/[0.08]"
          : "border-amber-400/25 bg-amber-400/[0.08]"
      }`}
    >
      <p
        className={`text-sm font-semibold ${expired ? "text-rose-300" : "text-amber-300"}`}
      >
        {expired
          ? access.subscription
            ? "Your access has expired"
            : "You don't have an active plan"
          : `Your plan expires in ${access.daysLeft} day${access.daysLeft === 1 ? "" : "s"}`}
      </p>
      <p className="mt-0.5 text-sm text-zinc-400">
        {expired
          ? "Renew now to keep learning. Your progress is saved."
          : "Renew early so you never lose momentum."}
      </p>
      <Link
        href="/pricing"
        className={`mt-3 inline-block rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-[0.98] ${
          expired
            ? "bg-rose-500 text-white hover:brightness-110"
            : "bg-amber-500 text-amber-950 hover:brightness-110"
        }`}
      >
        {expired ? "Renew now" : "Renew early"}
      </Link>
    </div>
  );
}