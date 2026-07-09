import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Verify certificate" };

// Public page, no auth. Fetches via service role and exposes only:
// validity, learner first name, track title, issue date.
export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const admin = createAdminClient();
  const { data: cert } = await admin
    .from("certificates")
    .select("verification_code, issued_at, tracks(title), profiles(display_name)")
    .eq("verification_code", code.toUpperCase())
    .maybeSingle();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-5 py-10">
      <Link href="/" className="text-lg font-bold tracking-tight text-white">
        PLATFORM
      </Link>

      {cert ? (
        <div className="mt-8 w-full rounded-2xl border border-emerald-400/40 bg-emerald-400/[0.06] p-6 shadow-[0_0_36px_rgba(16,185,129,0.15)] text-center">
          <p className="text-4xl">✅</p>
          <h1 className="mt-3 text-xl font-bold text-white">
            Valid certificate
          </h1>
          <div className="mt-5 space-y-2 text-sm">
            <p className="text-zinc-500">
              Learner:{" "}
              <span className="font-semibold text-white">
                {(
                  cert.profiles as unknown as { display_name: string }
                ).display_name.split(" ")[0]}
              </span>
            </p>
            <p className="text-zinc-500">
              Course:{" "}
              <span className="font-semibold text-white">
                {(cert.tracks as unknown as { title: string }).title}
              </span>
            </p>
            <p className="text-zinc-500">
              Issued:{" "}
              <span className="font-semibold text-white">
                {new Date(cert.issued_at).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </p>
            <p className="text-zinc-500">
              Code:{" "}
              <span className="font-mono font-semibold text-cyan-300">
                {cert.verification_code}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 w-full rounded-2xl border border-rose-400/40 bg-rose-500/[0.06] p-6 text-center">
          <p className="text-4xl">❌</p>
          <h1 className="mt-3 text-xl font-bold text-white">
            Certificate not found
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            The code <span className="font-mono">{code}</span> does not match
            any certificate we have issued. Check the code and try again.
          </p>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-zinc-500">
        Want AI skills too?{" "}
        <Link href="/start" className="font-medium text-indigo-300 hover:text-indigo-200">
          Take the 1-minute quiz
        </Link>
      </p>
    </div>
  );
}
