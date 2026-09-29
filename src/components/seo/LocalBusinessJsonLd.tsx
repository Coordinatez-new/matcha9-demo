import { site } from "@/lib/site";

/** schema.org data for the café. Opening hours are omitted until the client confirms them. */
export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: site.name,
    slogan: site.motto,
    description: site.description,
    url: site.url,
    telephone: "+1-872-299-8880",
    priceRange: "$",
    servesCuisine: ["Matcha", "Tea"],
    hasMenu: `${site.url.replace(/\/$/, "")}/menu`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    sameAs: [site.instagram.href],
    parentOrganization: {
      "@type": "Organization",
      name: "Taco Maya",
      url: "https://www.tacomaya.com/",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
