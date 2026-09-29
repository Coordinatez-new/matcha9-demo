import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageIntroProps = {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** Opening block for inner pages: eyebrow, large serif title, lede. Animates in with CSS. */
export function PageIntro({ eyebrow, title, children, className }: PageIntroProps) {
  return (
    <section className={cn("container-page pt-14 pb-14 md:pt-20 md:pb-20", className)}>
      <div className="animate-rise">
        <p className="eyebrow text-sage-deep">{eyebrow}</p>
        <h1 className="mt-6 max-w-5xl text-display-xl">{title}</h1>
        {children && (
          <div className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
