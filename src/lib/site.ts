/**
 * Verified business facts for Matcha 9.
 * Source: the local research folder `../resources/brand/brand-facts.json` (not part of this repo).
 * Items marked "unconfirmed" there, such as opening hours, are left out until the client confirms them.
 */
export const site = {
  name: "Matcha 9",
  tagline: "Wellness drinks, made beautiful.",
  motto: "Crafted with Intention",
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
  phone: { display: "(872) 299-8880", href: "tel:+18722998880" },
  instagram: { handle: "@sipmatcha9", href: "https://www.instagram.com/sipmatcha9/" },
  orderUrl: "https://tacomaya.toast.site/order/taco-maya-jhoom-bar",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=2529+N+Milwaukee+Ave+Chicago+IL+60647",
} as const;
