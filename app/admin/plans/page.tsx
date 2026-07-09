import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { updatePlan } from "../actions";

export default async function AdminPlansPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: plans } = await admin
    .from("plans")
    .select("*")
    .order("audience", { ascending: true })
    .order("price_kes", { ascending: true });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Plans</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Price changes apply to new checkouts immediately. Existing
          subscriptions are unaffected.
        </p>
      </div>

      <div className="space-y-3">
        {(plans ?? []).map((plan) => {
          const save = updatePlan.bind(null, plan.id);
          return (
            <form
              key={plan.id}
              action={save}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900">
                  {plan.title}
                </p>
                <p className="text-xs text-zinc-500">
                  {plan.slug} · {plan.audience} · {plan.duration_days} days
                  {plan.max_child_profiles > 0
                    ? ` · ${plan.max_child_profiles} kids`
                    : ""}
                </p>
              </div>
              <label className="flex items-center gap-1 text-sm text-zinc-600">
                KES
                <input
                  name="price_kes"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue={Math.round(parseFloat(plan.price_kes))}
                  className="w-24 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
                />
              </label>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={plan.is_active}
                />
                Active
              </label>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Save
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}