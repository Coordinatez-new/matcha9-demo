import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowRight, ArrowUpRight } from "./icons";

type Variant = "primary" | "outline" | "light" | "outline-light";

type Size = "md" | "sm";

const base =
  "group/button inline-flex items-center justify-center gap-2.5 rounded-full text-[0.72rem] font-semibold tracking-[0.18em] whitespace-nowrap uppercase transition-colors duration-300 ease-calm";

const sizes: Record<Size, string> = {
  md: "px-7 py-3.5",
  sm: "px-6 py-3",
};

const variants: Record<Variant, string> = {
  primary: "bg-moss text-cream hover:bg-forest",
  outline: "border border-moss/25 text-moss hover:border-moss hover:bg-moss hover:text-cream",
  light: "bg-cream text-forest hover:bg-paper",
  "outline-light":
    "border border-cream/30 text-cream hover:border-cream hover:bg-cream hover:text-forest",
};

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  external?: boolean;
  /** Layout-only classes (width, margins). Don't pass display, padding or colour here. */
  className?: string;
};

/** Pill-shaped link button. External links open in a new tab with an arrow cue. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  external,
  className,
}: ButtonLinkProps) {
  const classes = cn(base, sizes[size], variants[variant], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
};

/** Understated text link with an underline that draws in on hover. */
export function ArrowLink({ href, children, external, className }: ArrowLinkProps) {
  const inner = (
    <>
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-(--ease-calm) group-hover/arrow:bg-[length:100%_1px]">
        {children}
      </span>
      {external ? (
        <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover/arrow:translate-x-0.5 group-hover/arrow:-translate-y-0.5" />
      ) : (
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/arrow:translate-x-1" />
      )}
    </>
  );
  const classes = cn(
    "group/arrow inline-flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.18em] uppercase",
    className,
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}
