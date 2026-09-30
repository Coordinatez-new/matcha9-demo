import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderView } from "@/components/views/OrderView";
import { getGuestOrder } from "@/server/orders";
import { getSettings } from "@/server/settings";

// Route type helpers (PageProps) don't cover `.server.tsx` pages, so props are typed here.
type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

export default async function OrderPage(props: Props) {
  const { id } = await props.params;
  const [order, settings] = await Promise.all([getGuestOrder(id), getSettings()]);
  if (!order) notFound();
  return <OrderView order={order} pickupInstructions={settings.ordering.pickupInstructions} />;
}
