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
        <h1 className="text-xl font-semibold text-zinc-900">Log in</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Pick up where you left off.
        </p>
      </div>
      {banner && (
        <p className="rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          {banner}
        </p>
      )}
      <LoginForm next={next ?? "/app"} />
      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="font-medium text-indigo-600">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-zinc-600">
          Create account
        </Link>
      </div>
    </div>
  );
}
