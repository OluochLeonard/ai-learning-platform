import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCertificateDownloadUrl } from "@/lib/certificates";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // RLS proves ownership (owner or parent of the child owner).
  const supabase = await createClient();
  const { data: cert } = await supabase
    .from("certificates")
    .select("pdf_url")
    .eq("id", id)
    .single();
  if (!cert?.pdf_url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = await getCertificateDownloadUrl(cert.pdf_url);
  if (!url) {
    return NextResponse.json({ error: "Unavailable" }, { status: 500 });
  }
  return NextResponse.redirect(url);
}
