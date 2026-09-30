import type { ReactNode } from "react";
import { toOrderable } from "@/lib/menu";
import { buildStorefront } from "@/lib/storefront";
import { getPublicMenu } from "@/server/menu";
import { getSettings } from "@/server/settings";
import { SiteFrame } from "./SiteFrame";

/** The storefront frame, filled from the database (server build). */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [settings, menu] = await Promise.all([getSettings(), getPublicMenu()]);
  const storefront = buildStorefront(
    settings,
    menu.items.filter((i) => i.featured).map(toOrderable),
    new Date(),
  );
  return (
    <SiteFrame storefront={storefront} announcement={settings.announcement}>
      {children}
    </SiteFrame>
  );
}
