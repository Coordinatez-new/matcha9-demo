import type { StaticImageData } from "next/image";

import posterChill from "@/assets/community/poster-matcha9-and-chill.webp";
import posterSip from "@/assets/community/poster-sip-n-gossip.webp";
import posterPopUp from "@/assets/community/poster-pop-up.webp";
import logoBoard from "@/assets/community/launch-logo-board.webp";
import milwaukeeAve from "@/assets/community/launch-milwaukee-ave.webp";
import windowPoster from "@/assets/community/launch-window-poster.webp";
import clubSign from "@/assets/community/matcha-club-sign.webp";
import jewelledGlass from "@/assets/community/jewelled-glass.webp";
import jewelledCupSidewalk from "@/assets/community/jewelled-cup-sidewalk.webp";
import jewelledCupStreet from "@/assets/community/jewelled-cup-street.webp";
import breakGlass from "@/assets/community/poster-break-glass.webp";

/** Events so far, from the @sipmatcha9 Instagram account. */
export type CommunityEvent = {
  date: string;
  day: string;
  title: string;
  kind: string;
  time: string;
  body: string;
  poster: StaticImageData;
  posterAlt: string;
  href: string;
};

export const events: CommunityEvent[] = [
  {
    date: "2026-09-09",
    day: "Wed, Sep 9",
    title: "Matcha 9 & Chill",
    kind: "Soft launch",
    time: "4 PM onwards",
    body: "Our 09.09 soft launch. Thank you to everyone who stopped by to try Matcha 9. We’re crafting with intention, one cup at a time.",
    poster: posterChill,
    posterAlt: "“Matcha 9 & Chill, 4 pm onwards, 09.09” poster over a layered matcha",
    href: "https://www.instagram.com/p/DdFBHfFhiKM/",
  },
  {
    date: "2026-09-19",
    day: "Sat, Sep 19",
    title: "Sip N Gossip",
    kind: "Creators’ afternoon",
    time: "12 – 3 PM",
    body: "An exclusive afternoon for Chicago influencers and creators: come sip, gossip and meet other creators over some good matcha. We sip. We gossip. We glow.",
    poster: posterSip,
    posterAlt:
      "“Sip N Gossip, influencers and creators exclusive event, Sat Sep 19, 12–3 PM” poster",
    href: "https://www.instagram.com/p/DdPK7qjhA-u/",
  },
  {
    date: "2026-09-27",
    day: "Sun, Sep 27",
    title: "Matcha 9 Pop-Up",
    kind: "Free matcha",
    time: "12 – 3 PM",
    body: "One more for the month: free matcha and the full menu reveal at 2529 N Milwaukee Ave. Tag a friend you’d bring.",
    poster: posterPopUp,
    posterAlt: "“Matcha 9 Pop Up, free matcha, Sun Sept 27th, 12–3 PM” poster",
    href: "https://www.instagram.com/p/Ddr0bg1GPxx/",
  },
];

export type GalleryImage = { src: StaticImageData; alt: string; href: string };

export const gallery: GalleryImage[] = [
  {
    src: clubSign,
    alt: "Jewelled Matcha 9 A-frame sign outside a window lettered Matcha Club",
    href: "https://www.instagram.com/p/DddIpmtgPWO/",
  },
  {
    src: logoBoard,
    alt: "A layered matcha held up to the Matcha 9 “Crafted With Intention” board",
    href: "https://www.instagram.com/p/DdKmQ47GDkx/",
  },
  {
    src: jewelledGlass,
    alt: "Jewel-studded glass of layered matcha on white silk",
    href: "https://www.instagram.com/p/DddIpmtgPWO/",
  },
  {
    src: milwaukeeAve,
    alt: "An iced Matcha 9 drink on Milwaukee Avenue at golden hour",
    href: "https://www.instagram.com/p/DdKmQ47GDkx/",
  },
  {
    src: jewelledCupSidewalk,
    alt: "A jewel-decorated cup of pink and green matcha held on the sidewalk",
    href: "https://www.instagram.com/p/DddIpmtgPWO/",
  },
  {
    src: windowPoster,
    alt: "“Did you try Matcha 9 yet? Open for everyone!” window poster",
    href: "https://www.instagram.com/p/DdKmQ47GDkx/",
  },
  {
    src: jewelledCupStreet,
    alt: "Jewel-decorated matcha cup outside on Milwaukee Avenue",
    href: "https://www.instagram.com/p/DddIpmtgPWO/",
  },
  {
    src: breakGlass,
    alt: "“In case of emergency break glass” poster with a layered matcha",
    href: "https://www.instagram.com/p/DdxXVxKRq9k/",
  },
];
