"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ openOrders, layout }: { openOrders: number; layout: "side" | "top" }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard">
      <ul
        className={cn(
          layout === "side" ? "space-y-1" : "-mx-1 no-scrollbar flex gap-1 overflow-x-auto px-1",
        )}
      >
        {items.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "bg-cream/12 text-cream"
                    : "text-cream/65 hover:bg-cream/6 hover:text-cream",
                )}
              >
                {item.label}
                {item.href === "/admin/orders" && openOrders > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-terracotta px-1.5 text-[0.68rem] font-semibold text-forest tabular-nums">
                    {openOrders}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
