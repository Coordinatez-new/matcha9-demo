import type { Metadata } from "next";
import { DemoMenuList } from "@/demo/pages/admin";

export const metadata: Metadata = { title: "Menu" };

export default function Page() {
  return <DemoMenuList />;
}
