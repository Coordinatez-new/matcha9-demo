import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Building blocks for the dashboard: quieter than the storefront, same palette and type. */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow text-sage-deep">{eyebrow}</p>}
        <h1 className="mt-3 font-display text-[2.6rem] leading-none md:text-5xl">{title}</h1>
        {description && (
          <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("rounded-xl border border-line bg-paper", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            {title && <h2 className="font-sans text-[0.95rem] font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={cn(padded && "p-6")}>{children}</div>
    </section>
  );
}

type Tone = "neutral" | "green" | "amber" | "red" | "dark";

const tones: Record<Tone, string> = {
  neutral: "border-line bg-cream text-ink-soft",
  green: "border-olive/25 bg-olive/10 text-sage-deep",
  amber: "border-terracotta/30 bg-terracotta/10 text-terracotta-deep",
  red: "border-terracotta-deep/30 bg-terracotta-deep/10 text-terracotta-deep",
  dark: "border-moss bg-moss text-cream",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide whitespace-nowrap",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-paper p-5">
      <p className="text-xs font-medium tracking-wide text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-4xl leading-none text-moss tabular-nums">{value}</p>
      {note && <p className="mt-2 text-xs text-ink-soft">{note}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-line bg-cream/60 px-3.5 py-2.5 text-[0.95rem] text-ink transition-colors placeholder:text-sage focus:border-moss focus:bg-paper focus:outline-none aria-[invalid=true]:border-terracotta-deep";

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint && <span className="text-xs text-ink-soft">{hint}</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {error && <span className="mt-1.5 block text-sm text-terracotta-deep">{error}</span>}
    </label>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center">
      <p className="font-display text-2xl text-moss">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{children}</div>}
    </div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50";

export const adminButton = {
  primary: cn(buttonBase, "bg-moss px-5 py-2.5 text-cream hover:bg-forest"),
  secondary: cn(
    buttonBase,
    "border border-line bg-paper px-5 py-2.5 text-moss hover:border-moss/40",
  ),
  ghost: cn(buttonBase, "px-3 py-2 text-ink-soft hover:bg-cream hover:text-moss"),
  danger: cn(
    buttonBase,
    "border border-terracotta-deep/30 px-5 py-2.5 text-terracotta-deep hover:bg-terracotta-deep hover:text-cream",
  ),
  icon: cn(
    buttonBase,
    "size-9 border border-line bg-paper text-moss hover:border-moss/40 disabled:opacity-30",
  ),
};
