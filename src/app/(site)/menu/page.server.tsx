import type { Metadata } from "next";
import { MenuView } from "@/components/views/MenuView";
import { menuDescription } from "@/lib/menu";
import { pageMetadata } from "@/lib/metadata";
import { getPublicMenu } from "@/server/menu";

export async function generateMetadata(): Promise<Metadata> {
  const { items } = await getPublicMenu();
  return pageMetadata({ title: "Menu", description: menuDescription(items) });
}

export default async function MenuPage() {
  const { items, categories } = await getPublicMenu();
  return <MenuView items={items} categories={categories} />;
}
