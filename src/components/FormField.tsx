// A labelled input, styled once and reused by every form on the site.
type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  hint?: string;
  required?: boolean;
};

export default function FormField({
  label,
  name,
  type = "text",
  autoComplete,
  defaultValue,
  hint,
  required = true,
}: FormFieldProps) {
  const hintId = hint ? `${name}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={required}
        aria-describedby={hintId}
        className="rounded-md border border-line bg-white px-3 py-2.5 text-ink outline-none focus:border-road"
      />
      {hint && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
