import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

export default function FormField({ id, label, error, hint, className, ...props }: FormFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:ring-2 focus:outline-none disabled:bg-slate-50 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
            : "border-slate-300 focus:border-teal-600 focus:ring-teal-100"
        }`}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
