import { NextResponse, type NextRequest } from "next/server";
import { getPaymentProvider } from "@/lib/payments";

// Provider-agnostic IPN endpoint. Pesapal will POST its notification
// here; the stub provider accepts { merchant_reference, status }.
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const provider = getPaymentProvider();
  const result = await provider.handleIPN(payload);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
