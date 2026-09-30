import type { Metadata } from "next";
import { DemoOrder } from "@/demo/pages/order";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

export default function OrderPage() {
  return <DemoOrder />;
}
