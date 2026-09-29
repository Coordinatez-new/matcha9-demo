/**
 * Verified business facts for Matcha 9.
 * Source: the local research folder `../resources/brand/brand-facts.json` (not part of this repo).
 */

/** Public address of the site: explicit, or detected on Vercel and Railway. */
function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Matcha 9",
  tagline: "Wellness drinks, made beautiful.",
  motto: "Crafted with Intention",
  values: ["Ritual", "Community", "Wellness"],
  description:
    "Matcha 9 is a matcha bar inside Taco Maya in Logan Square, Chicago. Signature drinks made with certified organic, ceremonial-grade Japanese matcha, whisked to order. Order ahead for pickup.",
  url: siteUrl(),
  address: {
    street: "2529 N Milwaukee Ave, Ste B",
    city: "Chicago",
    region: "IL",
    postalCode: "60647",
    neighborhood: "Logan Square",
    venue: "Inside Taco Maya",
  },
  geo: { lat: 41.9273494, lng: -87.7043953 },
  // Opening hours and the Toast ordering link are edited in the dashboard (settings table).
  phone: { display: "(872) 299-8880", href: "tel:+18722998880" },
  instagram: { handle: "@sipmatcha9", href: "https://www.instagram.com/sipmatcha9/" },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=2529+N+Milwaukee+Ave+Chicago+IL+60647",
  // Address-only query: Google's card then shows the address rather than an empty review count.
  mapEmbedUrl:
    "https://www.google.com/maps?q=2529+N+Milwaukee+Ave,+Chicago,+IL+60647&z=16&output=embed",
  tacoMaya: { name: "Taco Maya", href: "https://www.tacomaya.com/location/logan-square/" },
  allergyNote:
    "Prepared in a kitchen that handles milk, nuts and gluten. Please tell us about any allergy before you order.",
} as const;

/** The header keeps to the two places guests need; everything else lives in the footer. */
export const nav = [
  { href: "/menu", label: "Menu" },
  { href: "/visit", label: "Visit" },
] as const;

export const footerNav = [
  { href: "/menu", label: "Menu" },
  { href: "/story", label: "Our Story" },
  { href: "/matcha", label: "Our Matcha" },
  { href: "/community", label: "Community" },
  { href: "/visit", label: "Visit" },
] as const;

export const siteOrigin = new URL(site.url).origin;

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;
