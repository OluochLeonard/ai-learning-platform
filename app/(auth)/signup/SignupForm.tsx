"use client";

import { useActionState } from "react";
import { signup, type AuthActionState } from "./actions";

const initialState: AuthActionState = { error: null };

export default function SignupForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label
          className="form-label"
          htmlFor="display_name"
        >
          Your name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          className="input-field mt-1"
        />
      </div>
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
          htmlFor="phone"
        >
          Phone (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="07XX XXX XXX"
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
          minLength={8}
          className="input-field mt-1"
        />
      </div>
      {state.error && <p className="text-sm text-rose-400">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
