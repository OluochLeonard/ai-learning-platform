import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          We&apos;ll email you a link to set a new one.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-zinc-400">
        <Link href="/login" className="font-medium text-indigo-300 hover:text-indigo-200">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
