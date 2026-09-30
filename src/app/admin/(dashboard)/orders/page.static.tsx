import type { Metadata } from "next";
import { DemoOrders } from "@/demo/pages/admin";

export const metadata: Metadata = { title: "Orders" };

export default function Page() {
  return <DemoOrders />;
}
