import "server-only";
import { randomBytes } from "crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "certificates";

export type CertificateRow = {
  id: string;
  profile_id: string;
  track_id: string;
  verification_code: string;
  issued_at: string;
  pdf_url: string | null;
};

// Unambiguous alphabet (no 0/O, 1/I) so codes survive being read aloud.
function newVerificationCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let code = "";
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return code;
}

// Called after each lesson completion. If the whole track is now
// complete and no certificate exists yet, generates + stores the PDF
// and inserts the certificates row. Returns the cert when the track is
// complete, else null. Service role: certificate writes are server-side
// only per the access model.
export async function ensureCertificate(
  profileId: string,
  trackId: string,
): Promise<CertificateRow | null> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("certificates")
    .select("*")
    .eq("profile_id", profileId)
    .eq("track_id", trackId)
    .maybeSingle();
  if (existing) return existing;

  // Is every published lesson in the track complete?
  const { data: lessons } = await admin
    .from("lessons")
    .select("id, modules!inner(track_id)")
    .eq("is_published", true)
    .eq("modules.track_id", trackId);
  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) return null;

  const { count } = await admin
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .not("completed_at", "is", null)
    .in("lesson_id", lessonIds);
  if ((count ?? 0) < lessonIds.length) return null;

  const [{ data: profile }, { data: track }] = await Promise.all([
    admin.from("profiles").select("display_name").eq("id", profileId).single(),
    admin.from("tracks").select("title").eq("id", trackId).single(),
  ]);
  if (!profile || !track) return null;

  const code = newVerificationCode();
  const issuedAt = new Date();
  const pdfBytes = await renderCertificatePdf(
    profile.display_name,
    track.title,
    code,
    issuedAt,
  );

  await admin.storage
    .createBucket(BUCKET, { public: false })
    .catch(() => undefined); // already exists

  const path = `${code}.pdf`;
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, pdfBytes, { contentType: "application/pdf" });
  if (uploadError) throw uploadError;

  const { data: cert, error: insertError } = await admin
    .from("certificates")
    .insert({
      profile_id: profileId,
      track_id: trackId,
      verification_code: code,
      issued_at: issuedAt.toISOString(),
      pdf_url: path,
    })
    .select()
    .single();
  if (insertError) {
    // Lost a race with a concurrent completion: return the winner's row.
    const { data: raced } = await admin
      .from("certificates")
      .select("*")
      .eq("profile_id", profileId)
      .eq("track_id", trackId)
      .maybeSingle();
    if (raced) return raced;
    throw insertError;
  }
  return cert;
}

export async function getCertificateDownloadUrl(
  storagePath: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 10, {
      download: true,
    });
  return data?.signedUrl ?? null;
}

async function renderCertificatePdf(
  learnerName: string,
  trackTitle: string,
  code: string,
  issuedAt: Date,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();

  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const indigo = rgb(0.31, 0.27, 0.9);
  const zinc = rgb(0.28, 0.28, 0.32);
  const light = rgb(0.55, 0.55, 0.6);

  // Border
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: indigo,
    borderWidth: 3,
  });
  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: indigo,
    borderWidth: 0.75,
  });

  const centered = (
    text: string,
    y: number,
    size: number,
    font = helvetica,
    color = zinc,
  ) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y, size, font, color });
  };

  // Brand placeholder (real brand later)
  centered("PLATFORM", height - 100, 22, bold, indigo);
  centered("CERTIFICATE OF COMPLETION", height - 150, 16, helvetica, light);

  centered("This certifies that", height - 210, 13, helvetica, light);
  centered(learnerName, height - 255, 34, bold, zinc);

  centered("has successfully completed the course", height - 300, 13, helvetica, light);
  centered(trackTitle, height - 340, 24, bold, indigo);

  const dateText = issuedAt.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  centered(`Issued on ${dateText}`, height - 390, 12, helvetica, zinc);

  // Divider
  page.drawLine({
    start: { x: width / 2 - 120, y: 150 },
    end: { x: width / 2 + 120, y: 150 },
    thickness: 0.75,
    color: light,
  });

  const siteHost = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://ai-learning-platform-gamma-ruby.vercel.app"
  ).replace(/^https?:\/\//, "");
  centered(`Verification code: ${code}`, 125, 11, helvetica, zinc);
  centered(`Verify at ${siteHost}/verify/${code}`, 105, 9, helvetica, light);

  return doc.save();
}
