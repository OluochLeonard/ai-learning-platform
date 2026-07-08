import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          We&apos;ll email you a link to set a new one.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-zinc-600">
        <Link href="/login" className="font-medium text-indigo-600">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
