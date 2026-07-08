import Link from "next/link";
import type { AccessState } from "@/lib/subscription";

export default function RenewBanner({ access }: { access: AccessState }) {
  if (access.hasAccess && (access.daysLeft ?? 99) > 3) return null;

  const expired = !access.hasAccess;
  return (
    <div
      className={`rounded-xl px-4 py-3 ${
        expired
          ? "bg-red-50 text-red-800"
          : "bg-amber-50 text-amber-800"
      }`}
    >
      <p className="text-sm font-semibold">
        {expired
          ? access.subscription
            ? "Your access has expired"
            : "You don't have an active plan"
          : `Your plan expires in ${access.daysLeft} day${access.daysLeft === 1 ? "" : "s"}`}
      </p>
      <p className="mt-0.5 text-sm">
        {expired
          ? "Renew now to keep learning. Your progress is saved."
          : "Renew early so you never lose momentum."}
      </p>
      <Link
        href="/pricing"
        className={`mt-2 inline-block rounded-lg px-4 py-2 text-sm font-semibold text-white ${
          expired
            ? "bg-red-600 hover:bg-red-500"
            : "bg-amber-600 hover:bg-amber-500"
        }`}
      >
        {expired ? "Renew now" : "Renew early"}
      </Link>
    </div>
  );
}
