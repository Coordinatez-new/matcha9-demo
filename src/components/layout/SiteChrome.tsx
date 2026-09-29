import type { ReactNode } from "react";
import { WhiskCursor } from "@/components/cursor/WhiskCursor";
import { BagDrawer } from "@/components/order/BagDrawer";
import { BagProvider } from "@/components/order/BagProvider";
import { toOrderable } from "@/lib/menu";
import { buildStorefront } from "@/lib/storefront";
import { getPublicMenu } from "@/server/menu";
import { getSettings } from "@/server/settings";
import { AnnouncementBar } from "./AnnouncementBar";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Header, footer, bag and cursor around every storefront page. */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [settings, menu] = await Promise.all([getSettings(), getPublicMenu()]);
  const storefront = buildStorefront(
    settings,
    menu.items.filter((i) => i.featured).map(toOrderable),
  );
  const toastMode = settings.ordering.mode === "toast";

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
        {settings.announcement.enabled && settings.announcement.text && (
          <AnnouncementBar announcement={settings.announcement} />
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
