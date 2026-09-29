"use client";

import type { ReactNode } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowUpRight } from "@/components/ui/icons";
import { useBag } from "./BagProvider";

type Props = {
  variant?: "primary" | "outline" | "light" | "outline-light";
  size?: "md" | "sm";
  className?: string;
  children?: ReactNode;
};

/**
 * "Order pickup" call to action for page sections. Opens the bag when ordering happens on the
 * site, or links out when it's handed to Toast.
 */
export function OrderPickupButton({
  variant = "primary",
  size = "md",
  className,
  children,
}: Props) {
  const { storefront, openBag } = useBag();
  const label = children ?? "Order pickup";

  if (storefront.mode === "toast") {
    return (
      <a
        href={storefront.toastUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses(variant, size, className)}
      >
        {label}
        <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
      </a>
    );
  }
  return (
    <button type="button" onClick={openBag} className={buttonClasses(variant, size, className)}>
      {label}
    </button>
  );
}
