import Link from "next/link";
import { getActiveProfile } from "@/lib/profile";
import { getAccessState } from "@/lib/subscription";
import RenewBanner from "@/components/RenewBanner";

export default async function AppHomePage() {
  const profile = await getActiveProfile();
  const access = await getAccessState();

  return (
    <div className="mx-auto max-w-md space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          Hey {profile?.display_name ?? "there"}
        </h1>
        <p className="mt-1 text-zinc-600">
          {access.hasAccess
            ? "Ready for today's lesson?"
            : "Let's get you learning."}
        </p>
      </div>

      <RenewBanner access={access} />

      {access.hasAccess ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-semibold text-zinc-900">
            Jump into today&apos;s lesson
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Short, practical lessons. Your access is active until{" "}
            {access.expiresAt?.toLocaleDateString("en-KE", {
              day: "numeric",
              month: "long",
            })}
            .
          </p>
          <Link
            href="/app/courses"
            className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Go to courses
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-semibold text-zinc-900">
            Unlock all lessons
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Get full access to every course, practice exercise and
            certificate. Pay easily with M-Pesa.
          </p>
          <Link
            href="/pricing"
            className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            See plans
          </Link>
        </div>
      )}
    </div>
  );
}
