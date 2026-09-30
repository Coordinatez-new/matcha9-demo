import { cn } from "@/lib/cn";

/**
 * A small vermilion seal (hanko) with 九, "nine", the way a Japanese maker signs their work.
 * Decorative: screen readers skip it.
 */
export function Hanko({ className, char = "九" }: { className?: string; char?: string }) {
  return (
    <span aria-hidden="true" className={cn("m9-hanko", className)}>
      <span>{char}</span>
    </span>
  );
}
