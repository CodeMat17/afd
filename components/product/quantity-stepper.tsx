"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { isAtMinimum, isDecimalString, normaliseQuantity, stepQuantity } from "@/lib/money";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  id,
  value,
  minimum,
  step,
  unitLabel,
  label,
  onChange,
  size = "default",
}: {
  id: string;
  value: string;
  minimum: string;
  step: string;
  unitLabel: string;
  label: string;
  onChange: (value: string) => void;
  size?: "default" | "sm";
}) {
  // Draft lets people type freely; it is normalised on blur / Enter.
  const [draft, setDraft] = useState<string | null>(null);
  const atMin = isAtMinimum(value, minimum);

  const commit = () => {
    if (draft === null) return;
    const next = isDecimalString(draft) ? normaliseQuantity(draft, minimum, step) : value;
    setDraft(null);
    if (next !== value) onChange(next);
  };

  const buttonClass = cn(
    "flex shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent",
    size === "sm" ? "size-10" : "size-11",
  );

  return (
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      className={cn(
        "inline-flex items-center rounded-full border border-input bg-surface p-0.5",
        size === "sm" ? "h-11" : "h-12",
      )}
    >
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(stepQuantity(value, minimum, step, -1))}
        disabled={atMin}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <label htmlFor={id} className="sr-only">
        Quantity in {unitLabel}
      </label>
      <input
        id={id}
        inputMode="decimal"
        value={draft ?? value}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        className={cn(
          "w-12 bg-transparent text-center font-semibold tabular-nums outline-none focus-visible:outline-none",
          size === "sm" ? "text-sm" : "text-base",
        )}
      />
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(stepQuantity(value, minimum, step, 1))}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
