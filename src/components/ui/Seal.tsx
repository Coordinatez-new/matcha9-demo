import { cn } from "@/lib/cn";

type SealProps = { text: string; className?: string };

/** Circular text seal with a slow rotation (paused for reduced motion). Decorative. */
export function Seal({ text, className }: SealProps) {
  return (
    <div
      className={cn("relative grid size-32 place-items-center rounded-full bg-cream", className)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" className="absolute inset-0 size-full animate-spin-slow">
        <defs>
          <path id="seal-circle" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
        </defs>
        <text className="fill-moss font-sans text-[8.4px] font-semibold tracking-[0.32em] uppercase">
          <textPath href="#seal-circle">{text}</textPath>
        </text>
      </svg>
      <span className="font-display text-4xl text-moss">9</span>
    </div>
  );
}
