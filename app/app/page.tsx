import { getActiveProfile } from "@/lib/profile";

export default async function AppHomePage() {
  const profile = await getActiveProfile();

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold text-zinc-900">
        Hey {profile?.display_name ?? "there"}
      </h1>
      <p className="mt-2 text-zinc-600">
        Your courses and lessons land here in Phase 3.
      </p>
    </div>
  );
}
