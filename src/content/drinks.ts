import type { StaticImageData } from "next/image";

import simplyMatchaProduct from "@/assets/drinks/product/simply-matcha.webp";
import veryBerryProduct from "@/assets/drinks/product/very-berry.webp";
import greenGlowProduct from "@/assets/drinks/product/green-glow.webp";
import cocoChillProduct from "@/assets/drinks/product/coco-chill.webp";
import pistachioDripProduct from "@/assets/drinks/product/pistachio-drip.webp";
import mangoMagicProduct from "@/assets/drinks/product/mango-magic.webp";
import cinnamonMatchaMeltProduct from "@/assets/drinks/product/cinnamon-matcha-melt.webp";
import cookieCraveProduct from "@/assets/drinks/product/cookie-crave.webp";
import matchamisuProduct from "@/assets/drinks/product/matchamisu.webp";

import simplyMatchaBar from "@/assets/drinks/bar/simply-matcha.webp";
import veryBerryBar from "@/assets/drinks/bar/very-berry.webp";
import greenGlowBar from "@/assets/drinks/bar/green-glow.webp";
import cocoChillBar from "@/assets/drinks/bar/coco-chill.webp";
import pistachioDripBar from "@/assets/drinks/bar/pistachio-drip.webp";
import mangoMagicBar from "@/assets/drinks/bar/mango-magic.webp";
import cinnamonMatchaMeltBar from "@/assets/drinks/bar/cinnamon-matcha-melt.webp";
import cookieCraveBar from "@/assets/drinks/bar/cookie-crave.webp";
import matchamisuBar from "@/assets/drinks/bar/matchamisu.webp";

export type DrinkCategory = "classic" | "wellness" | "signature" | "indulgent";

export const categories: { id: DrinkCategory; label: string }[] = [
  { id: "classic", label: "Classics" },
  { id: "wellness", label: "Wellness blends" },
  { id: "signature", label: "Signatures" },
  { id: "indulgent", label: "Indulgent" },
];

export type IngredientGroup = { title: string; items: string };

export type Drink = {
  no: number;
  slug: string;
  name: string;
  price: number;
  /** Official menu line, split on the "•" separators (Toast / printed menu). */
  components: string[];
  category: DrinkCategory;
  badge?: string;
  tagline: string;
  intro: string;
  product: StaticImageData;
  productAlt: string;
  photo: StaticImageData;
  photoAlt: string;
  orderUrl: string;
  ingredients?: {
    lede: string;
    groups: IngredientGroup[];
    contains: string;
  };
};

const toast = "https://tacomaya.toast.site/order/taco-maya-jhoom-bar/";

export const drinks: Drink[] = [
  {
    no: 1,
    slug: "simply-matcha",
    name: "Simply Matcha",
    price: 5,
    components: ["Pure Matcha", "Milk or Water", "Hot or Iced"],
    category: "classic",
    badge: "Flagship",
    tagline: "Our flagship. No added sugar.",
    intro:
      "The drink the whole menu is built on. Organic, ceremonial-grade Japanese matcha, whisked to order and poured over milk or water, hot or iced. Pure and unfiltered, with zero additives, fillers or added sugar.",
    product: simplyMatchaProduct,
    productAlt: "Simply Matcha: iced matcha layered over milk in a short glass",
    photo: simplyMatchaBar,
    photoAlt: "Simply Matcha on the wooden serving board at the Matcha 9 bar",
    orderUrl: `${toast}item-simply-matcha_f6cf81c8-4ac9-4a34-8a5b-23b4f21b3b79`,
  },
  {
    no: 2,
    slug: "very-berry",
    name: "Very Berry",
    price: 6,
    components: ["Organic Fruit Mix", "Milk", "Matcha", "Creamy Strawberry"],
    category: "wellness",
    badge: "New",
    tagline: "A whole-food berry blend, not a flavour packet.",
    intro:
      "The berry in this drink isn’t a flavour packet. It’s a whole-food blend of nearly forty organic fruits and vegetables, layered with milk and matcha and finished with creamy strawberry.",
    product: veryBerryProduct,
    productAlt: "Very Berry: pink berry cream and whipped cream over layered matcha",
    photo: veryBerryBar,
    photoAlt: "Very Berry with a whipped cream crown at the Matcha 9 bar",
    orderUrl: `${toast}item-very-berry_728e2723-efe1-47b0-a5c4-20ebf19edaf8`,
    ingredients: {
      lede: "Nearly forty organic fruits and vegetables. All of it certified organic. Here’s the whole list.",
      groups: [
        {
          title: "Fruits and vegetables",
          items:
            "Beet root, apple, barley grass, amla, cauliflower, celery, moringa leaf, parsley, alfalfa sprouts, chlorella, spirulina, blueberry, raspberry, strawberry, carrot, broccoli, green cabbage, kale, spinach, tomato, acai, banana, cherry, pomegranate, black currant, bilberry, pineapple, papaya, cranberry, acerola, blackberry, mango, peach, pear, goji, elderberry, grape, maqui and lemon peel.",
        },
        {
          title: "Prebiotics and fiber",
          items:
            "Acacia gum, guar gum, Jerusalem artichoke inulin, blue agave inulin, oat fiber, flaxseed, apple fiber, orange peel and lemon.",
        },
        { title: "Focus blend", items: "Dried coffee bean, green tea leaf and ashwagandha root." },
        { title: "Enzymes", items: "Cellulase, bromelain, papain and a protease group." },
        {
          title: "Probiotics",
          items:
            "A dairy-free blend: B. subtilis, L. rhamnosus, B. bifidum, B. longum, L. acidophilus, L. casei and S. thermophilus.",
        },
      ],
      contains:
        "Milk. The blend includes barley grass and oat fiber, so this drink isn’t gluten-free, and enzymes from pineapple and papaya.",
    },
  },
  {
    no: 3,
    slug: "green-glow",
    name: "Green Glow",
    price: 6,
    components: ["Matcha", "Organic Super Greens", "Milk"],
    category: "wellness",
    tagline: "Eleven greens, ten mushrooms, one matcha.",
    intro:
      "Eleven organic greens, ten mushrooms and a probiotic blend, carried by matcha so none of it tastes like a green drink. Glow from the inside out.",
    product: greenGlowProduct,
    productAlt: "Green Glow: pale green super-greens milk streaked with matcha",
    photo: greenGlowBar,
    photoAlt: "Green Glow in a stemless glass at the Matcha 9 bar",
    orderUrl: `${toast}item-green-glow_7b4d996b-09e6-49fe-a9a7-c7d875c9ca15`,
    ingredients: {
      lede: "Eleven organic greens, ten mushrooms and a probiotic blend. All of it certified organic. Here’s the whole list.",
      groups: [
        {
          title: "Eleven organic greens",
          items:
            "Wheat grass, barley grass, spirulina, spinach, parsley, alfalfa, aloe vera, chlorella, broccoli, cabbage and kale.",
        },
        {
          title: "Prebiotics and fiber",
          items:
            "Pea fiber, acacia fiber gum, apple fiber, blue agave inulin, Jerusalem artichoke inulin, flaxseed and apple pectin.",
        },
        {
          title: "Adaptogenic mushrooms",
          items:
            "Chaga, cordyceps, lion’s mane, maitake, himematsutake, meshimakobus, oyster, reishi, shiitake and turkey tail.",
        },
        { title: "Probiotics", items: "Bacillus coagulans and Bacillus subtilis." },
      ],
      contains:
        "Milk, wheat (from wheat grass) and a blend of mushrooms. This drink isn’t gluten-free.",
    },
  },
  {
    no: 4,
    slug: "coco-chill",
    name: "Coco Chill",
    price: 6,
    components: ["Coconut Water", "Matcha", "Light & Refreshing"],
    category: "classic",
    tagline: "Matcha over coconut water. Light and refreshing.",
    intro:
      "Bright, freshly whisked matcha floated over chilled coconut water and ice. Light and refreshing by design, for the afternoons that call for something clean.",
    product: cocoChillProduct,
    productAlt: "Coco Chill: bright green matcha floating over coconut water",
    photo: cocoChillBar,
    photoAlt: "Coco Chill in a tall textured glass at the Matcha 9 bar",
    orderUrl: `${toast}item-coco-chill_875e0775-9fe1-4af2-8c9c-b396c9e5ecae`,
  },
  {
    no: 5,
    slug: "pistachio-drip",
    name: "Pistachio Drip",
    price: 7,
    components: ["Pistachio", "Matcha", "Roasted Pistachio Finish"],
    category: "signature",
    tagline: "Pistachio, matcha and a roasted pistachio finish.",
    intro:
      "Pistachio cream drips down the glass through layers of matcha, finished with roasted pistachio scattered over the foam.",
    product: pistachioDripProduct,
    productAlt: "Pistachio Drip: pistachio cream and matcha topped with crushed pistachio",
    photo: pistachioDripBar,
    photoAlt: "Pistachio Drip with a roasted pistachio finish at the Matcha 9 bar",
    orderUrl: `${toast}item-pistachio-drip_cff51c86-9996-432e-935a-559e7882d5ca`,
  },
  {
    no: 6,
    slug: "mango-magic",
    name: "Mango Magic",
    price: 6,
    components: ["Mango", "Matcha", "Tropical Cream Finish"],
    category: "signature",
    tagline: "Mango and matcha under a tropical cream finish.",
    intro: "Mango and deep green matcha in a tall glass, finished with a soft tropical cream top.",
    product: mangoMagicProduct,
    productAlt: "Mango Magic: tropical cream top over mango and matcha",
    photo: mangoMagicBar,
    photoAlt: "Mango Magic with a tropical cream finish at the Matcha 9 bar",
    orderUrl: `${toast}item-mango-magic_8d2f331c-aaff-4316-a42a-f3b3297a6255`,
  },
  {
    no: 7,
    slug: "cinnamon-matcha-melt",
    name: "Cinnamon Matcha Melt",
    price: 6,
    components: ["Horchata", "Matcha", "Cinnamon Finish"],
    category: "signature",
    tagline: "Horchata and matcha with a cinnamon finish.",
    intro:
      "Creamy horchata over freshly whisked matcha, finished with a dusting of cinnamon. Comfort in a glass.",
    product: cinnamonMatchaMeltProduct,
    productAlt: "Cinnamon Matcha Melt: horchata foam dusted with cinnamon over matcha",
    photo: cinnamonMatchaMeltBar,
    photoAlt: "Cinnamon Matcha Melt in a stemless glass at the Matcha 9 bar",
    orderUrl: `${toast}item-cinnamon-matcha-melt_48c26285-2c91-4c5d-92e3-01509b97a154`,
  },
  {
    no: 8,
    slug: "cookie-crave",
    name: "Cookie Crave",
    price: 7,
    components: ["Oreo", "Milk", "Matcha", "Chocolate Cream"],
    category: "indulgent",
    tagline: "Cookies and cream, the matcha way.",
    intro:
      "Oreo, milk and matcha under swirls of chocolate cream, in a chocolate-rimmed glass with a cocoa-dusted top.",
    product: cookieCraveProduct,
    productAlt: "Cookie Crave: chocolate cream, Oreo and matcha layers",
    photo: cookieCraveBar,
    photoAlt: "Cookie Crave in a chocolate-rimmed glass at the Matcha 9 bar",
    orderUrl: `${toast}item-cookie-crave_79800564-297a-4458-bfe4-3fa869c73ca4`,
  },
  {
    no: 9,
    slug: "matchamisu",
    name: "Matchamisu",
    price: 7,
    components: ["Milk", "Matcha", "Tiramisu Cream", "Matcha Dust"],
    category: "indulgent",
    tagline: "Tiramisu, reimagined in matcha.",
    intro:
      "Layers of matcha and milk under a tiramisu cream crown, finished with a dusting of matcha.",
    product: matchamisuProduct,
    productAlt: "Matchamisu: tiramisu cream crown dusted with matcha over layered matcha",
    photo: matchamisuBar,
    photoAlt: "Matchamisu with matcha dust at the Matcha 9 bar",
    orderUrl: `${toast}item-matchamisu_acfe2f5c-1beb-4721-90c0-49c8743ec101`,
  },
];

export function getDrink(slug: string): Drink | undefined {
  return drinks.find((d) => d.slug === slug);
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function drinkNumber(no: number): string {
  return `No. ${String(no).padStart(2, "0")}`;
}
