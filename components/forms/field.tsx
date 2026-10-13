import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const controlClass =
  "w-full rounded-md border border-input bg-surface px-4 text-[0.9375rem] transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/70 hover:border-foreground/40 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 focus-visible:outline-none aria-invalid:border-destructive aria-invalid:ring-destructive/10 disabled:cursor-not-allowed disabled:opacity-60";

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

function FieldShell({ id, label, error, hint, optional, className, children }: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {optional ? <span className="ml-1.5 font-normal text-muted-foreground">(optional)</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function TextField({
  id,
  label,
  error,
  hint,
  optional,
  className,
  ...props
}: Omit<FieldShellProps, "children"> & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={className}>
      <input
        id={id}
        name={props.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        required={!optional}
        className={cn(controlClass, "h-12")}
        {...props}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  label,
  error,
  hint,
  optional,
  className,
  ...props
}: Omit<FieldShellProps, "children"> & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={className}>
      <textarea
        id={id}
        name={props.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        required={!optional}
        rows={5}
        className={cn(controlClass, "min-h-32 resize-y py-3 leading-relaxed")}
        {...props}
      />
    </FieldShell>
  );
}

/** Focus the first control flagged invalid after a failed submit. */
export function focusFirstInvalid(form: HTMLFormElement) {
  const el = form.querySelector<HTMLElement>("[aria-invalid='true']");
  el?.focus();
}
