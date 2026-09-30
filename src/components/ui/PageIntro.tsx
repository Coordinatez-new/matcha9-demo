import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageIntroProps = {
  eyebrow: string;
  /** Japanese word set vertically at the side on large screens. Decorative. */
  jp?: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** Opening block for inner pages: eyebrow, large serif title, lede. Animates in with CSS. */
export function PageIntro({ eyebrow, jp, title, children, className }: PageIntroProps) {
  return (
    <section className={cn("relative container-page pt-14 pb-14 md:pt-20 md:pb-20", className)}>
      {jp && (
        <span
          lang="ja"
          aria-hidden="true"
          className="pointer-events-none absolute top-16 right-[clamp(1.25rem,4vw,3rem)] hidden animate-fade-in font-jp text-[5.5rem] leading-none text-moss/[0.08] select-none tategaki lg:block xl:text-[7rem]"
        >
          {jp}
        </span>
      )}
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
