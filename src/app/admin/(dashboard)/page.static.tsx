import type { Metadata } from "next";
import { DemoOverview } from "@/demo/pages/admin";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return <DemoOverview />;
}
