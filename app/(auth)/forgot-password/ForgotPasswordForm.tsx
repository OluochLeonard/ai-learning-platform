"use client";

import { useActionState } from "react";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = { error: null, success: false };

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.success) {
    return (
      <p className="text-sm text-zinc-700">
        If an account exists for that email, we&apos;ve sent a reset link.
        Check your inbox.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium text-zinc-700"
          htmlFor="email"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
