import type { ReactNode } from "react";
import { WhiskCursor } from "@/components/cursor/WhiskCursor";
import { BagDrawer } from "@/components/order/BagDrawer";
import { BagProvider } from "@/components/order/BagProvider";
import type { AnnouncementSettings } from "@/lib/settings";
import type { Storefront } from "@/lib/storefront";
import { AnnouncementBar } from "./AnnouncementBar";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Header, footer, bag and cursor around every storefront page. */
export function SiteFrame({
  storefront,
  announcement,
  children,
}: {
  storefront: Storefront;
  announcement: AnnouncementSettings;
  children: ReactNode;
}) {
  const toastMode = storefront.mode === "toast";
  return (
    <BagProvider storefront={storefront}>
      {/* Everything but the bag drawer, so the drawer can make it inert while open. */}
      <div id="site-shell">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-moss focus:px-5 focus:py-3 focus:text-sm focus:text-cream"
        >
          Skip to content
        </a>
        {announcement.enabled && announcement.text && (
          <AnnouncementBar announcement={announcement} />
        )}
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter
          hours={storefront.hours}
          orderHref={toastMode ? storefront.toastUrl : "/menu"}
          orderExternal={toastMode}
        />
      </div>
      <BagDrawer />
      <WhiskCursor />
    </BagProvider>
  );
}
