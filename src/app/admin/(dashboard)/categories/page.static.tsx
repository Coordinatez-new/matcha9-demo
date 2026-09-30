import type { Metadata } from "next";
import { DemoCategories } from "@/demo/pages/admin";

export const metadata: Metadata = { title: "Categories" };

export default function Page() {
  return <DemoCategories />;
}
