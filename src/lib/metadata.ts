import type { Metadata } from "next";
import { site } from "./site";

type PageMetadataInput = {
  title: string;
  description: string;
  images?: NonNullable<Metadata["openGraph"]>["images"];
};

/** The root share image (src/app/opengraph-image.jpg), as an absolute URL including the base path. */
const defaultShareImage = {
  url: `${site.url.replace(/\/$/, "")}/opengraph-image.jpg`,
  width: 1200,
  height: 630,
  alt: "Matcha 9 logo beside an iced layered matcha held up against the plant wall at the Logan Square bar.",
};

/**
 * Page metadata with matching Open Graph tags. A page's `openGraph` replaces the root one
 * entirely (including the file-based share image), so the shared fields are repeated here.
 */
export function pageMetadata({ title, description, images }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_US",
      title: `${title} · ${site.name}`,
      description,
      images: images ?? [defaultShareImage],
    },
  };
}
