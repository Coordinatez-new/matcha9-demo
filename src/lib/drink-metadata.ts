import type { Metadata } from "next";
import { formatMoney, type MenuItem } from "@/lib/menu";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

/** Title, description and share image for a drink's page. */
export function drinkMetadata(item: MenuItem): Metadata {
  const description = `${item.name}, ${formatMoney(item.priceCents)}: ${item.components.join(" · ")}. ${item.tagline}`;
  const image = item.productImage ?? item.photoImage;
  return pageMetadata({
    title: item.name,
    description,
    images: image
      ? [
          {
            url: `${site.url.replace(/\/$/, "")}${image.src}`,
            width: image.width,
            height: image.height,
            alt: item.productImageAlt,
          },
        ]
      : undefined,
  });
}
