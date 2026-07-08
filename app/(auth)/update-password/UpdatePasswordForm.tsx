"use client";

import { useActionState } from "react";
import { updatePassword, type UpdatePasswordState } from "./actions";

const initialState: UpdatePasswordState = { error: null };

export default function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium text-zinc-700"
          htmlFor="password"
        >
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save password"}
      </button>
    </form>
  );
}
