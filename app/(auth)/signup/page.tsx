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
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Start learning AI skills today.
        </p>
      </div>
      <SignupForm next={next ?? "/app"} />
      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-medium text-indigo-300 hover:text-indigo-200"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
