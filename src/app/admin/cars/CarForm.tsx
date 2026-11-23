"use client";

import { useActionState } from "react";
import Link from "next/link";
import { options, type CarFormState } from "@/lib/car-form";

// The same form is used for "Add car" and "Edit car".
// `action` decides which server action it calls; `initial` pre-fills it.
type CarFormProps = {
  action: (prev: CarFormState, formData: FormData) => Promise<CarFormState>;
  initial?: Record<string, string>;
  submitLabel: string;
};

const inputClass =
  "w-full rounded-md border border-line bg-white px-3 py-2.5 text-ink outline-none focus:border-road aria-[invalid=true]:border-red-600";

export default function CarForm({ action, initial = {}, submitLabel }: CarFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  // After a failed save, show what they typed; otherwise the starting values
  const values = state?.values ?? initial;
  const errors = state?.errors ?? {};

  // Small helpers so each field is one line below
  const field = (name: string, label: string, opts: { type?: string; hint?: string; required?: boolean; inputMode?: "numeric" | "decimal" } = {}) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="font-medium">
        {label}
        {opts.required === false && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={opts.type ?? "text"}
        inputMode={opts.inputMode}
        defaultValue={values[name] ?? ""}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${name}-error` : opts.hint ? `${name}-hint` : undefined}
        className={inputClass}
      />
      {errors[name] ? (
        <p id={`${name}-error`} className="text-sm text-red-700">{errors[name]}</p>
      ) : (
        opts.hint && <p id={`${name}-hint`} className="text-sm text-muted">{opts.hint}</p>
      )}
    </div>
  );

  const select = (name: keyof typeof options, label: string) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="font-medium">{label}</label>
      <select
        id={name}
        name={name}
        defaultValue={values[name] ?? ""}
        aria-invalid={errors[name] ? true : undefined}
        className={inputClass}
      >
        <option value="" disabled>Choose…</option>
        {Object.entries(options[name]).map(([value, text]) => (
          <option key={value} value={value}>{text}</option>
        ))}
      </select>
      {errors[name] && <p className="text-sm text-red-700">{errors[name]}</p>}
    </div>
  );

  const section = "grid gap-5 rounded-lg border border-line bg-white p-5 sm:grid-cols-2";
  const heading = "font-sign text-2xl font-bold sm:col-span-2";

  return (
    // key forces React to reset the form after each save attempt so defaultValues refresh
    <form action={formAction} className="flex flex-col gap-6" key={JSON.stringify(values)}>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-red-800">
          Some details need fixing. Check the fields marked in red.
        </p>
      )}

      <fieldset className={section}>
        <legend className="sr-only">The car</legend>
        <h2 className={heading}>The car</h2>
        {field("make", "Make", { hint: "e.g. Toyota" })}
        {field("model", "Model", { hint: "e.g. Land Cruiser Prado" })}
        {field("year", "Year", { inputMode: "numeric" })}
        {field("color", "Colour")}
        {field("plateNumber", "Number plate", { required: false, hint: "e.g. GR 1234-24. Not shown to customers." })}
        {select("bodyType", "Body type")}
        {select("transmission", "Transmission")}
        {select("fuelType", "Fuel")}
        {field("seats", "Seats", { inputMode: "numeric" })}
        {field("mileage", "Mileage (km)", { inputMode: "numeric" })}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="description" className="font-medium">
            Description <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea id="description" name="description" rows={3} defaultValue={values.description ?? ""} className={inputClass} />
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="sr-only">Price and status</legend>
        <h2 className={heading}>Price and status</h2>
        {field("salePrice", "Price (GH₵)", { inputMode: "decimal", required: false, hint: "Leave empty to show \"Call for price\"." })}
        {select("status", "Status")}
        <label className="flex items-center gap-3 sm:col-span-2">
          <input type="checkbox" name="featured" defaultChecked={values.featured === "on"} className="size-5 accent-road" />
          <span>Feature this car (shown first in listings)</span>
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-marking px-6 py-3 font-sign text-xl font-semibold text-road hover:bg-marking-dark disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/admin/cars" className="font-sign text-lg font-semibold text-muted hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
