import type { Metadata } from "next";
import { DemoSettings } from "@/demo/pages/admin";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <DemoSettings />;
}
