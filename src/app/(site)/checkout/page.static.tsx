import type { Metadata } from "next";
import { DemoCheckout } from "@/demo/pages/storefront";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <DemoCheckout />;
}
