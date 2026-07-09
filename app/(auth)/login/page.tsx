import Link from "next/link";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; message?: string }>;
}) {
  const { next, message } = await searchParams;

  const banner =
    message === "check-email"
      ? "Check your email to confirm your account, then log in."
      : message === "password-updated"
        ? "Password updated. Log in with your new password."
        : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Log in</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Pick up where you left off.
        </p>
      </div>
      {banner && (
        <p className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200">
          {banner}
        </p>
      )}
      <LoginForm next={next ?? "/app"} />
      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="font-medium text-indigo-300 hover:text-indigo-200">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-zinc-400 hover:text-zinc-200">
          Create account
        </Link>
      </div>
    </div>
  );
}
