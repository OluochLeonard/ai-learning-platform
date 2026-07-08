import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Your certificate" };

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS: owner (or parent of the child owner) only.
  const { data: cert } = await supabase
    .from("certificates")
    .select("*, tracks(title), profiles(display_name)")
    .eq("id", id)
    .single();
  if (!cert) redirect("/app/progress");

  const headerList = await headers();
  const host = headerList.get("host") ?? "";
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  const siteUrl = `${proto}://${host}`;
  const verifyUrl = `${siteUrl}/verify/${cert.verification_code}`;

  const trackTitle = (cert.tracks as { title: string }).title;
  const learnerName = (cert.profiles as { display_name: string }).display_name;
  const issued = new Date(cert.issued_at);

  const whatsappText = encodeURIComponent(
    `I just completed "${trackTitle}" on PLATFORM! 🎓 Verify my certificate: ${verifyUrl}`,
  );
  const linkedinUrl =
    `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME` +
    `&name=${encodeURIComponent(trackTitle)}` +
    `&organizationName=${encodeURIComponent("PLATFORM")}` +
    `&issueYear=${issued.getFullYear()}` +
    `&issueMonth=${issued.getMonth() + 1}` +
    `&certUrl=${encodeURIComponent(verifyUrl)}` +
    `&certId=${encodeURIComponent(cert.verification_code)}`;

  return (
    <div className="mx-auto max-w-md space-y-5 p-6">
      <div className="rounded-2xl border-2 border-indigo-600 bg-white p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          PLATFORM
        </p>
        <p className="mt-3 text-xs uppercase tracking-wide text-zinc-400">
          Certificate of completion
        </p>
        <p className="mt-4 text-2xl font-bold text-zinc-900">{learnerName}</p>
        <p className="mt-2 text-sm text-zinc-500">
          has successfully completed
        </p>
        <p className="mt-1 text-lg font-semibold text-indigo-700">
          {trackTitle}
        </p>
        <p className="mt-3 text-xs text-zinc-500">
          Issued{" "}
          {issued.toLocaleDateString("en-KE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          Code: {cert.verification_code}
        </p>
      </div>

      <a
        href={`/api/certificates/${cert.id}/download`}
        className="block w-full rounded-xl bg-indigo-600 px-6 py-4 text-center text-base font-semibold text-white hover:bg-indigo-500"
      >
        Download PDF
      </a>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-500"
        >
          Share on WhatsApp
        </a>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-sky-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-sky-600"
        >
          Add to LinkedIn
        </a>
      </div>

      <p className="text-center text-xs text-zinc-500">
        Anyone can verify this certificate at{" "}
        <Link href={`/verify/${cert.verification_code}`} className="text-indigo-600">
          {verifyUrl.replace(/^https?:\/\//, "")}
        </Link>
      </p>

      <p className="text-center">
        <Link href="/app/progress" className="text-sm text-zinc-500">
          ← Back to progress
        </Link>
      </p>
    </div>
  );
}
