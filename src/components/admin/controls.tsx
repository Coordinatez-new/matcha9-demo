"use client";

import { useOptimistic, useTransition, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";
import { adminButton } from "./ui";

/**
 * A switch bound to a server action. Flips instantly (optimistic) and settles when the server
 * confirms; the page data refreshes from the action's revalidation.
 */
export function ActionSwitch({
  checked,
  action,
  label,
  onLabel,
  offLabel,
}: {
  checked: boolean;
  action: (value: boolean) => Promise<void>;
  label: string;
  onLabel?: string;
  offLabel?: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(checked);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={label}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await action(!optimistic);
        })
      }
      className="group inline-flex items-center gap-2.5 disabled:cursor-wait"
    >
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
          optimistic ? "bg-moss" : "bg-line",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-paper shadow-sm transition-transform duration-300 ease-calm",
            optimistic && "translate-x-5",
          )}
        />
      </span>
      {(onLabel || offLabel) && (
        <span
          className={cn(
            "min-w-[4.5rem] text-left text-sm",
            optimistic ? "text-ink" : "text-ink-soft",
          )}
        >
          {optimistic ? onLabel : offLabel}
        </span>
      )}
    </button>
  );
}

/** Submit button that shows progress while its form's action runs. */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  className,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: keyof typeof adminButton;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(adminButton[variant], className)}>
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Button that runs a bound server action, with an optional confirmation. */
export function ActionButton({
  action,
  children,
  pendingLabel,
  confirm,
  variant = "secondary",
  className,
}: {
  action: () => Promise<void>;
  children: ReactNode;
  pendingLabel?: string;
  confirm?: string;
  variant?: keyof typeof adminButton;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        startTransition(() => action());
      }}
      className={cn(adminButton[variant], className)}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

export function FormMessage({ state }: { state: { ok: boolean; message: string } | null }) {
  if (!state) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn("text-sm", state.ok ? "text-sage-deep" : "text-terracotta-deep")}
    >
      {state.message}
    </p>
  );
}
