import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStubProvider } from "@/lib/payments";
import { formatKes } from "@/types/db";
import { simulateSuccessfulPayment } from "./actions";

export const metadata = { title: "Pay with M-Pesa" };

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ paymentId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { paymentId } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS scopes payments to the signed-in account.
  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();
  if (!payment) redirect("/pricing");
  if (payment.status === "completed") redirect("/welcome");

  const simulateWithId = simulateSuccessfulPayment.bind(null, payment.id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          📲
        </div>
        <h1 className="mt-4 text-xl font-bold text-zinc-900">
          Check your phone
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          We sent an M-Pesa prompt for{" "}
          <span className="font-semibold">{formatKes(payment.amount_kes)}</span>
          . Enter your M-Pesa PIN to complete payment.
        </p>
        <div className="mt-4 rounded-lg bg-zinc-50 px-4 py-3 text-left text-xs text-zinc-500">
          <p>Reference: {payment.merchant_reference}</p>
          <p className="mt-1">
            Didn&apos;t get the prompt? Wait a few seconds, it can take a
            moment.
          </p>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600">
            Something went wrong confirming your payment. Try again.
          </p>
        )}
      </div>

      {isStubProvider() && (
        <div className="mt-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Test mode
          </p>
          <p className="mt-1 text-sm text-amber-800">
            M-Pesa is not connected yet. Use the button below to simulate the
            payment confirmation.
          </p>
          <form action={simulateWithId} className="mt-3">
            <button
              type="submit"
              className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-500"
            >
              Simulate successful payment
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
