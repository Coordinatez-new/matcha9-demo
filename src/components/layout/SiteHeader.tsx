"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "@/assets/brand/matcha9-logo.webp";
import { cn } from "@/lib/cn";
import { fullAddress, nav, site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";
import { CloseIcon, InstagramIcon, MenuIcon } from "@/components/ui/icons";

function isActive(pathname: string, href: string) {
  const clean = (p: string) => (p.endsWith("/") ? p : `${p}/`);
  return clean(pathname).startsWith(clean(href));
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close the mobile menu on Escape and lock page scroll while it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || open
            ? "border-b border-line bg-cream/90 backdrop-blur-md"
            : "border-b border-transparent bg-cream",
        )}
      >
        <div className="container-page flex h-20 items-center gap-8">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3"
            aria-label={`${site.name}, home`}
          >
            <Image src={logo} alt="" className="h-11 w-auto" preload />
            <span className="font-display text-[1.2rem] font-medium tracking-[0.22em] whitespace-nowrap text-moss uppercase sm:text-[1.35rem] sm:tracking-[0.26em]">
              Matcha 9
            </span>
          </Link>

          <nav aria-label="Main" className="ml-auto hidden xl:block">
            <ul className="flex items-center gap-9">
              {nav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative text-[0.8rem] font-medium tracking-[0.14em] whitespace-nowrap uppercase transition-colors duration-300",
                        "after:absolute after:-bottom-1.5 after:left-0 after:h-px after:bg-moss after:transition-[width] after:duration-500",
                        active
                          ? "text-moss after:w-full"
                          : "text-ink-soft after:w-0 hover:text-moss hover:after:w-full",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-3 xl:ml-2">
            <div className="hidden sm:block">
              <ButtonLink href={site.orderUrl} external size="sm">
                Order pickup
              </ButtonLink>
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-11 place-items-center rounded-full border border-moss/20 text-moss transition-colors hover:bg-moss hover:text-cream xl:hidden"
            >
              {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise become the containing
          block for this fixed overlay and collapse it to the header's height. */}
      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-20 bottom-0 z-40 flex animate-fade-in flex-col overflow-y-auto bg-cream xl:hidden"
        >
          <nav aria-label="Main" className="container-page pt-8">
            <ul className="divide-y divide-line border-y border-line">
              {nav.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className="flex items-baseline gap-5 py-5 font-display text-4xl text-moss"
                  >
                    <span className="font-display text-base text-sage italic">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="container-page mt-auto space-y-6 py-10">
            <ButtonLink href={site.orderUrl} external className="w-full">
              Order pickup
            </ButtonLink>
            <div className="text-sm leading-relaxed text-ink-soft">
              <p>{fullAddress}</p>
              <p>
                {site.address.venue} · {site.hours.label}, {site.hours.time}
              </p>
            </div>
            <a
              href={site.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-moss"
            >
              <InstagramIcon className="size-4" /> {site.instagram.handle}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
