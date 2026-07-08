"use client";

import { useActionState } from "react";
import { signup, type AuthActionState } from "./actions";

const initialState: AuthActionState = { error: null };

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium text-zinc-700"
          htmlFor="display_name"
        >
          Your name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
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
      <div>
        <label
          className="block text-sm font-medium text-zinc-700"
          htmlFor="phone"
        >
          Phone (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="07XX XXX XXX"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium text-zinc-700"
          htmlFor="password"
        >
          Password
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
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
