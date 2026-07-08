import Link from "next/link";
import SignupForm from "./SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Start learning AI skills today.
        </p>
      </div>
      <SignupForm next={next ?? "/app"} />
      <p className="text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-medium text-indigo-600"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
