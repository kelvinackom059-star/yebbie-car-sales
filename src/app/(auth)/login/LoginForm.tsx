"use client";

import { useActionState } from "react";
import { login } from "../actions";
import FormField from "@/components/FormField";

export default function LoginForm() {
  // useActionState connects the form to the server action:
  // state   = what login() returned last time (e.g. an error)
  // pending = true while the server is working
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state?.error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-red-800">
          {state.error}
        </p>
      )}
      <FormField label="Email" name="email" type="email" autoComplete="email" defaultValue={state?.fields?.email} />
      <FormField label="Password" name="password" type="password" autoComplete="current-password" />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-marking px-5 py-3 font-sign text-xl font-semibold text-road hover:bg-marking-dark disabled:opacity-60"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
