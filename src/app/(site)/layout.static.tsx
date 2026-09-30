import type { ReactNode } from "react";
import { DemoSiteChrome } from "@/demo/pages/chrome";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <DemoSiteChrome>{children}</DemoSiteChrome>;
}
