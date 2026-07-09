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
      <div className="glass-strong animate-fade-up p-6 text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl">
          📲
          <span className="absolute inset-0 animate-ping rounded-full border border-emerald-400/40" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">
          Check your phone
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          We sent an M-Pesa prompt for{" "}
          <span className="font-semibold text-emerald-300">
            {formatKes(payment.amount_kes)}
          </span>
          . Enter your M-Pesa PIN to complete payment.
        </p>
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3 text-left text-xs text-zinc-500">
          <p>Reference: {payment.merchant_reference}</p>
          <p className="mt-1">
            Didn&apos;t get the prompt? Wait a few seconds, it can take a
            moment.
          </p>
        </div>
        {error && (
          <p className="mt-3 text-sm text-rose-400">
            Something went wrong confirming your payment. Try again.
          </p>
        )}
      </div>

      {isStubProvider() && (
        <div className="animate-fade-up anim-delay-1 mt-6 rounded-2xl border border-dashed border-amber-400/30 bg-amber-400/[0.06] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
            Test mode
          </p>
          <p className="mt-1 text-sm text-amber-200/80">
            M-Pesa is not connected yet. Use the button below to simulate the
            payment confirmation.
          </p>
          <form action={simulateWithId} className="mt-3">
            <button
              type="submit"
              className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-amber-950 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Simulate successful payment
            </button>
          </form>
        </div>
      )}
    </div>
  );
}