"use client";

import { cn } from "@/lib/cn";
import { orderLimits } from "@/lib/orders";
import { Minus, Plus } from "@/components/ui/icons";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  /** Lowest value the minus button goes to (0 lets it remove a bag line). */
  min?: number;
  label: string;
  size?: "sm" | "md";
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  label,
  size = "md",
}: QuantityStepperProps) {
  const button = cn(
    "grid place-items-center rounded-full text-moss transition-colors duration-300 hover:bg-moss hover:text-cream disabled:pointer-events-none disabled:opacity-30",
    size === "sm" ? "size-8" : "size-11",
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-full border border-moss/20",
        size === "sm" ? "gap-1 p-0.5" : "gap-2 p-1",
      )}
    >
      <button
        type="button"
        className={button}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={value === 1 && min === 0 ? "Remove" : "One fewer"}
      >
        <Minus className={size === "sm" ? "size-3.5" : "size-4"} />
      </button>
      <span
        className={cn(
          "text-center font-medium text-ink tabular-nums",
          size === "sm" ? "w-5 text-sm" : "w-7",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={button}
        onClick={() => onChange(value + 1)}
        disabled={value >= orderLimits.quantity}
        aria-label="One more"
      >
        <Plus className={size === "sm" ? "size-3.5" : "size-4"} />
      </button>
    </div>
  );
}
