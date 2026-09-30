import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatMoney, menuNumber, toOrderable, type MenuItem } from "@/lib/menu";
import { QuickAdd } from "@/components/order/QuickAdd";
import { imageSrc } from "@/lib/paths";

type DrinkCardProps = {
  item: MenuItem;
  /** Position on the full menu, for the "No. 01" label. */
  index: number;
  className?: string;
  /** Surface behind the product shot; product images are white and blend in via multiply. */
  surface?: "paper" | "cream";
  sizes?: string;
};

export function DrinkCard({
  item,
  index,
  className,
  surface = "paper",
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 80vw",
}: DrinkCardProps) {
  const href = `/menu/${item.slug}`;
  const image = item.productImage ?? item.photoImage;
  return (
    <div className={cn("group", className)}>
      <div
        className={cn(
          "relative aspect-[4/5] overflow-hidden rounded-lg",
          surface === "paper" ? "bg-paper" : "bg-cream",
        )}
      >
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          data-cursor="whisk"
          className="absolute inset-0"
        >
          {image && (
            <Image
              src={imageSrc(image.src)}
              alt=""
              fill
              sizes={sizes}
              className={cn(
                "transition-[transform,opacity] duration-[1.2s] ease-calm group-hover:scale-[1.045]",
                item.productImage
                  ? "object-contain object-center p-3 mix-blend-multiply sm:p-6"
                  : "object-cover",
                !item.inStock && "opacity-55",
              )}
            />
          )}
        </Link>
        <span className="pointer-events-none absolute top-3 left-3 eyebrow text-[0.62rem] text-sage-deep sm:top-5 sm:left-5 sm:text-[0.72rem]">
          {menuNumber(index)}
        </span>
        {item.badge && (
          <span className="pointer-events-none absolute top-2.5 right-2.5 hidden rounded-full border border-moss/15 bg-cream/80 px-3 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-moss uppercase backdrop-blur-sm sm:top-4 sm:right-4 sm:block">
            {item.badge}
          </span>
        )}
        {!item.inStock && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-cream/90 px-3 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-terracotta-deep uppercase sm:bottom-4 sm:left-4">
            Sold out today
          </span>
        )}
        <QuickAdd
          item={toOrderable(item)}
          className="absolute right-3 bottom-3 sm:right-4 sm:bottom-4"
        />
      </div>
      <Link href={href} className="block">
        <div className="mt-4 flex flex-col gap-1 sm:mt-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h3 className="font-display text-xl leading-tight text-moss transition-colors group-hover:text-sage-deep sm:text-[1.65rem]">
            {item.name}
          </h3>
          <span className="font-display text-lg text-ink-soft tabular-nums sm:text-xl">
            {formatMoney(item.priceCents)}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
          {item.components.join(" · ")}
        </p>
      </Link>
    </div>
  );
}
