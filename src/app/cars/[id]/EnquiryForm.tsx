"use client";

import { useActionState, useState } from "react";
import type { EnquiryFormState } from "./actions";

type Props = {
  action: (prev: EnquiryFormState, formData: FormData) => Promise<EnquiryFormState>;
};

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-road aria-[invalid=true]:border-red-600";

const types = [
  { value: "PURCHASE", label: "I want to buy this car" },
  { value: "TEST_DRIVE", label: "I'd like a test drive" },
  { value: "GENERAL", label: "I have a question" },
];

export default function EnquiryForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const v = state?.values ?? {};
  const errors = state?.errors ?? {};
  const [type, setType] = useState(v.type ?? "PURCHASE");

  if (state?.success) {
    return (
      <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-5 text-green-900">
        <p className="font-sign text-2xl font-bold">Thank you!</p>
        <p className="mt-1">We&apos;ve got your message and will call or WhatsApp you soon.</p>
      </div>
    );
  }

  const field = (name: string, label: string, opts: { type?: string; hint?: string; required?: boolean } = {}) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="font-medium">
        {label}
        {opts.required === false && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={opts.type ?? "text"}
        defaultValue={v[name] ?? ""}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${name}-error` : opts.hint ? `${name}-hint` : undefined}
        className={inputClass}
      />
      {errors[name] ? (
        <p id={`${name}-error`} className="text-sm text-red-700">
          {errors[name]}
        </p>
      ) : (
        opts.hint && (
          <p id={`${name}-hint`} className="text-sm text-muted">
            {opts.hint}
          </p>
        )
      )}
    </div>
  );

  return (
    <form action={formAction} className="flex flex-col gap-5" key={JSON.stringify(v)}>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-red-800">
          Some details need fixing. Check the fields marked in red.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", "Your name")}
        {field("phone", "Phone number", { type: "tel", hint: "We'll call or WhatsApp you on this number." })}
        {field("email", "Email", { type: "email", required: false })}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className="font-medium">
            What do you need?
          </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-invalid={errors.type ? true : undefined}
            className={inputClass}
          >
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {errors.type && <p className="text-sm text-red-700">{errors.type}</p>}
        </div>

        {type === "TEST_DRIVE" && (
          <div className="sm:col-span-2">{field("preferredDate", "Preferred date", { type: "date", required: false })}</div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          defaultValue={v.message ?? ""}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={inputClass}
        />
        {errors.message && (
          <p id="message-error" className="text-sm text-red-700">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people, tempting to bots */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-marking px-6 py-3 font-sign text-xl font-semibold text-road hover:bg-marking-dark disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
