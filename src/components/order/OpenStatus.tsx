import { cn } from "@/lib/cn";
import type { Storefront } from "@/lib/storefront";

/** One calm line about whether the bar can take an order right now. */
export function OpenStatus({
  storefront,
  className,
}: {
  storefront: Storefront;
  className?: string;
}) {
  const { mode, openNow, prepMinutes, nextOpening, pausedMessage } = storefront;
  const [tone, text] =
    mode === "paused"
      ? (["paused", pausedMessage] as const)
      : openNow
        ? (["open", `Open now · ready in about ${prepMinutes} minutes`] as const)
        : ([
            "closed",
            nextOpening
              ? `Closed right now. Order ahead for ${nextOpening.replace(/^(Today|Tomorrow)/, (m) => m.toLowerCase())}.`
              : "Closed right now.",
          ] as const);

  return (
    <p className={cn("flex items-start gap-2.5 text-sm leading-snug text-ink-soft", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          tone === "open" && "bg-matcha shadow-[0_0_0_4px_rgb(125_154_78/0.18)]",
          tone === "closed" && "bg-sage",
          tone === "paused" && "bg-terracotta",
        )}
      />
      <span>{text}</span>
    </p>
  );
}
