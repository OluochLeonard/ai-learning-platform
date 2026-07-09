"use client";

import { useActionState } from "react";
import { login, type AuthActionState } from "./actions";

const initialState: AuthActionState = { error: null };

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label
          className="form-label"
          htmlFor="email"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input-field mt-1"
        />
      </div>
      <div>
        <label
          className="form-label"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="input-field mt-1"
        />
      </div>
      {state.error && <p className="text-sm text-rose-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full"
      >
        {pending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
