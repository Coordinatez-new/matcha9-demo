import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DrinkView } from "@/components/views/DrinkView";
import { drinkMetadata } from "@/lib/drink-metadata";
import { getPublicItem, getPublicMenu } from "@/server/menu";

// Route type helpers (PageProps) don't cover `.server.tsx` pages, so props are typed here.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const item = await getPublicItem(slug);
  return item ? drinkMetadata(item) : {};
}

export default async function DrinkPage(props: Props) {
  const { slug } = await props.params;
  const [item, menu] = await Promise.all([getPublicItem(slug), getPublicMenu()]);
  if (!item) notFound();
  return <DrinkView item={item} menu={menu} />;
}
