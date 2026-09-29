import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { drinkNumber, formatPrice, type Drink } from "@/content/drinks";

type DrinkCardProps = {
  drink: Drink;
  className?: string;
  /** Surface behind the product shot; product images are white and blend in via multiply. */
  surface?: "paper" | "cream";
  sizes?: string;
};

export function DrinkCard({
  drink,
  className,
  surface = "paper",
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 80vw",
}: DrinkCardProps) {
  return (
    <Link href={`/menu/${drink.slug}/`} className={cn("group block", className)}>
      <div
        className={cn(
          "relative aspect-[4/5] overflow-hidden rounded-lg",
          surface === "paper" ? "bg-paper" : "bg-cream",
        )}
      >
        <Image
          src={drink.product}
          alt={drink.productAlt}
          fill
          sizes={sizes}
          className="object-contain object-center p-3 mix-blend-multiply transition-transform duration-[1.2s] ease-calm group-hover:scale-[1.045] sm:p-6"
        />
        <span className="absolute top-3 left-3 eyebrow text-[0.62rem] text-sage-deep sm:top-5 sm:left-5 sm:text-[0.72rem]">
          {drinkNumber(drink.no)}
        </span>
        {drink.badge && (
          <span className="absolute top-2.5 right-2.5 hidden rounded-full border border-moss/15 bg-cream/80 px-3 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-moss uppercase backdrop-blur-sm sm:top-4 sm:right-4 sm:block">
            {drink.badge}
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-1 sm:mt-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h3 className="font-display text-xl leading-tight text-moss transition-colors group-hover:text-sage-deep sm:text-[1.65rem]">
          {drink.name}
        </h3>
        <span className="font-display text-lg text-ink-soft tabular-nums sm:text-xl">
          {formatPrice(drink.price)}
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-soft sm:text-sm">
        {drink.components.join(" · ")}
      </p>
    </Link>
  );
}
