/**
 * Verified business facts for Matcha 9.
 * Source: the local research folder `../resources/brand/brand-facts.json` (not part of this repo).
 */
export const site = {
  name: "Matcha 9",
  tagline: "Wellness drinks, made beautiful.",
  motto: "Crafted with Intention",
  values: ["Ritual", "Community", "Wellness"],
  description:
    "Matcha 9 is a matcha bar inside Taco Maya in Logan Square, Chicago. Nine signature drinks made with certified organic, ceremonial-grade Japanese matcha, whisked to order.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  address: {
    street: "2529 N Milwaukee Ave, Ste B",
    city: "Chicago",
    region: "IL",
    postalCode: "60647",
    neighborhood: "Logan Square",
    venue: "Inside Taco Maya",
  },
  geo: { lat: 41.9273494, lng: -87.7043953 },
  // Hours as published on the client's own site. Still to be confirmed with the client.
  hours: { label: "Daily", time: "9 am – 2 pm" },
  phone: { display: "(872) 299-8880", href: "tel:+18722998880" },
  instagram: { handle: "@sipmatcha9", href: "https://www.instagram.com/sipmatcha9/" },
  orderUrl: "https://tacomaya.toast.site/order/taco-maya-jhoom-bar",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=2529+N+Milwaukee+Ave+Chicago+IL+60647",
  // Address-only query: Google's card then shows the address rather than an empty review count.
  mapEmbedUrl:
    "https://www.google.com/maps?q=2529+N+Milwaukee+Ave,+Chicago,+IL+60647&z=16&output=embed",
  tacoMaya: { name: "Taco Maya", href: "https://www.tacomaya.com/location/logan-square/" },
  // Wording from the Toast ordering page's rewards banner.
  rewards: "Order ahead online and earn 1 point for every $1 spent.",
  allergyNote:
    "Prepared in a kitchen that handles milk, nuts and gluten. Please tell us about any allergy before you order.",
} as const;

export const nav = [
  { href: "/menu/", label: "Menu" },
  { href: "/story/", label: "Our Story" },
  { href: "/matcha/", label: "Our Matcha" },
  { href: "/community/", label: "Community" },
  { href: "/visit/", label: "Visit" },
] as const;

/**
 * Origin only (no base path). Next.js already prefixes the base path onto metadata file URLs
 * such as opengraph-image, so the metadata base must not include it too.
 */
export const siteOrigin = new URL(site.url).origin;

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;
