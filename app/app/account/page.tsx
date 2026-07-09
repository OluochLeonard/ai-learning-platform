import Link from "next/link";
import { getActiveProfile } from "@/lib/profile";
import { signOut } from "./actions";

export default async function AccountPage() {
  const profile = await getActiveProfile();

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Account
        </h1>
        <p className="mt-1 text-zinc-400">
          Learning as {profile?.display_name}
        </p>
      </div>
      <div className="animate-fade-up anim-delay-1 space-y-3">
        <Link
          href="/profiles"
          className="glass glass-hover block px-4 py-3.5 text-sm font-medium text-zinc-200"
        >
          Switch profile / manage child profiles
        </Link>
        <Link
          href="/pricing"
          className="glass glass-hover block px-4 py-3.5 text-sm font-medium text-zinc-200"
        >
          Plans and renewal
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] px-4 py-3.5 text-left text-sm font-medium text-rose-300 transition-colors hover:border-rose-400/40 hover:bg-rose-500/10"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}