import { redirect } from "next/navigation";
import { getActiveProfile } from "@/lib/profile";

export default async function KidsZonePage() {
  const activeProfile = await getActiveProfile();
  if (!activeProfile?.is_child) redirect("/app");

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold text-zinc-900">
        Hey {activeProfile.display_name}
      </h1>
      <p className="mt-2 text-zinc-600">
        Your kids zone lessons land here in Phase 3.
      </p>
    </div>
  );
}
