import type { Metadata } from "next";
import { starterItems } from "@/content/menu";
import { DemoDrink } from "@/demo/pages/storefront";
import { drinkMetadata } from "@/lib/drink-metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return starterItems().map((item) => ({ slug: item.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = starterItems().find((i) => i.slug === slug);
  return item ? drinkMetadata(item) : {};
}

export default async function DrinkPage({ params }: Props) {
  const { slug } = await params;
  return <DemoDrink slug={slug} />;
}
