import Link from "next/link";
import { getActiveProfile } from "@/lib/profile";
import { signOut } from "./actions";

export default async function AccountPage() {
  const profile = await getActiveProfile();

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Account</h1>
        <p className="mt-1 text-zinc-600">
          Learning as {profile?.display_name}
        </p>
      </div>
      <div className="space-y-3">
        <Link
          href="/profiles"
          className="block rounded-lg border border-zinc-200 px-4 py-3 text-sm font-medium hover:bg-zinc-50"
        >
          Switch profile / manage child profiles
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
