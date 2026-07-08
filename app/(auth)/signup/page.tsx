import Link from "next/link";
import SignupForm from "./SignupForm";

export default function SignupPage() {
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
      <SignupForm />
      <p className="text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600">
          Log in
        </Link>
      </p>
    </div>
  );
}
