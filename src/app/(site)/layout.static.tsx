import type { ReactNode } from "react";
import { DemoSiteChrome } from "@/demo/pages/storefront";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <DemoSiteChrome>{children}</DemoSiteChrome>;
}
