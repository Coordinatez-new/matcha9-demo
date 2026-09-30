import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeaderProps = {
  eyebrow?: string;
  /** Optional index shown before the eyebrow, e.g. "01". */
  index?: string;
  /** Optional Japanese word set after the eyebrow, e.g. 献立 (menu). Decorative. */
  jp?: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  as?: "h1" | "h2";
};

export function SectionHeader({
  eyebrow,
  index,
  jp,
  title,
  children,
  align = "left",
  tone = "light",
  className,
  as: Heading = "h2",
}: SectionHeaderProps) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {(eyebrow || index) && (
        <p
          className={cn(
            "flex items-center gap-3 eyebrow",
            align === "center" && "justify-center",
            dark ? "text-sage" : "text-sage-deep",
          )}
        >
          {index && <span className="font-display text-sm tracking-normal italic">{index}</span>}
          {index && eyebrow && (
            <span className={cn("h-px w-8", dark ? "bg-cream/25" : "bg-line")} />
          )}
          {eyebrow}
          {jp && (
            <span
              lang="ja"
              aria-hidden="true"
              className={cn(
                "font-jp text-[0.8rem] font-normal tracking-[0.35em] normal-case",
                dark ? "text-cream/45" : "text-sage",
              )}
            >
              {jp}
            </span>
          )}
        </p>
      )}
      <Heading className={cn("mt-5 text-display-lg", dark && "text-cream")}>{title}</Heading>
      {children && (
        <div
          className={cn("mt-6 text-lg leading-relaxed", dark ? "text-cream/75" : "text-ink-soft")}
        >
          {children}
        </div>
      )}
    </div>
  );
}
