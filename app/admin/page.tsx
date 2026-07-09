import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatKes } from "@/types/db";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const now = new Date().toISOString();
  const [
    { count: signups },
    { count: activeSubs },
    { data: payments },
    { count: funnelResponses },
    { count: completedPayments },
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_child", false),
    admin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .gt("expires_at", now),
    admin.from("payments").select("amount_kes").eq("status", "completed"),
    admin
      .from("funnel_responses")
      .select("id", { count: "exact", head: true }),
    admin
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
  ]);

  const revenue = (payments ?? []).reduce(
    (sum, p) => sum + parseFloat(p.amount_kes),
    0,
  );
  const conversion =
    funnelResponses && funnelResponses > 0
      ? Math.round(((completedPayments ?? 0) / funnelResponses) * 100)
      : null;

  const { data: recent } = await admin
    .from("payments")
    .select("amount_kes, status, created_at, profiles(display_name)")
    .order("created_at", { ascending: false })
    .limit(8);

  const stats = [
    { label: "Signups", value: String(signups ?? 0) },
    { label: "Active subs", value: String(activeSubs ?? 0) },
    { label: "Revenue", value: formatKes(revenue) },
    {
      label: "Funnel conversion",
      value: conversion === null ? "n/a" : `${conversion}%`,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <p className="text-xs text-zinc-500">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-zinc-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <p className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900">
          Recent payments
        </p>
        {(recent ?? []).length === 0 ? (
          <p className="px-4 py-6 text-sm text-zinc-500">No payments yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {(recent ?? []).map((p, i) => (
              <li
                key={i}
                className="flex items-center justify-between px-4 py-2.5 text-sm"
              >
                <span className="text-zinc-700">
                  {(p.profiles as unknown as { display_name: string })
                    ?.display_name ?? "Unknown"}
                </span>
                <span className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {p.status}
                  </span>
                  <span className="font-medium text-zinc-900">
                    {formatKes(p.amount_kes)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}