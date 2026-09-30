import type { Category, Ingredients, LibraryImage, MenuItem, OptionGroup } from "@/lib/menu";

/**
 * The starting menu: the client's real drinks, names and prices from their live Toast menu,
 * copy from their printed menu and QR ingredient pages. The server loads it into an empty
 * database once; the static design preview (GitHub Pages) runs on it directly.
 */

const categories = [
  { id: "classic", label: "Classics", description: "Pure matcha, simply poured." },
  {
    id: "wellness",
    label: "Wellness blends",
    description: "Certified organic whole-food blends, carried by matcha.",
  },
  { id: "signature", label: "Signatures", description: "Layered house creations." },
  { id: "indulgent", label: "Indulgent", description: "Dessert in a glass." },
];

const toastBase = "https://tacomaya.toast.site/order/taco-maya-jhoom-bar/";

type SeedItem = {
  slug: string;
  name: string;
  price: number;
  categoryId: string;
  badge?: string;
  tagline: string;
  description: string;
  components: string[];
  ingredients?: Ingredients;
  options?: OptionGroup[];
  product: [number, number];
  productAlt: string;
  photo: [number, number];
  photoAlt: string;
  /** Toast item page slug; its trailing UUID is the Toast menu item GUID. */
  toast: string;
  featured?: boolean;
};

// Only the options the client publishes: Toast lists Simply Matcha as "Milk or Water • Hot or
// Iced". Anything else (alt milks, sweetness, sizes) is for the client to add in the dashboard.
const simplyMatchaOptions: OptionGroup[] = [
  {
    id: "serve",
    name: "Serve",
    type: "single",
    required: true,
    defaultChoiceId: "iced",
    choices: [
      { id: "iced", label: "Iced", priceCents: 0 },
      { id: "hot", label: "Hot", priceCents: 0 },
    ],
  },
  {
    id: "base",
    name: "Base",
    type: "single",
    required: true,
    defaultChoiceId: "milk",
    choices: [
      { id: "milk", label: "Milk", priceCents: 0 },
      { id: "water", label: "Water", priceCents: 0 },
    ],
  },
];

const items: SeedItem[] = [
  {
    slug: "simply-matcha",
    name: "Simply Matcha",
    price: 5,
    categoryId: "classic",
    badge: "Flagship",
    tagline: "Our flagship. No added sugar.",
    description:
      "The drink the whole menu is built on. Organic, ceremonial-grade Japanese matcha, whisked to order and poured over milk or water, hot or iced. Pure and unfiltered, with zero additives, fillers or added sugar.",
    components: ["Pure Matcha", "Milk or Water", "Hot or Iced"],
    options: simplyMatchaOptions,
    product: [720, 720],
    productAlt: "Simply Matcha: iced matcha layered over milk in a short glass",
    photo: [720, 961],
    photoAlt: "Simply Matcha on the wooden serving board at the Matcha 9 bar",
    toast: "item-simply-matcha_f6cf81c8-4ac9-4a34-8a5b-23b4f21b3b79",
    featured: true,
  },
  {
    slug: "very-berry",
    name: "Very Berry",
    price: 6,
    categoryId: "wellness",
    badge: "New",
    tagline: "A whole-food berry blend, not a flavour packet.",
    description:
      "The berry in this drink isn’t a flavour packet. It’s a whole-food blend of nearly forty organic fruits and vegetables, layered with milk and matcha and finished with creamy strawberry.",
    components: ["Organic Fruit Mix", "Milk", "Matcha", "Creamy Strawberry"],
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
    product: [720, 720],
    productAlt: "Very Berry: pink berry cream and whipped cream over layered matcha",
    photo: [667, 889],
    photoAlt: "Very Berry with a whipped cream crown at the Matcha 9 bar",
    toast: "item-very-berry_728e2723-efe1-47b0-a5c4-20ebf19edaf8",
    featured: true,
  },
  {
    slug: "green-glow",
    name: "Green Glow",
    price: 6,
    categoryId: "wellness",
    tagline: "Eleven greens, ten mushrooms, one matcha.",
    description:
      "Eleven organic greens, ten mushrooms and a probiotic blend, carried by matcha so none of it tastes like a green drink. Glow from the inside out.",
    components: ["Matcha", "Organic Super Greens", "Milk"],
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
    product: [720, 720],
    productAlt: "Green Glow: pale green super-greens milk streaked with matcha",
    photo: [720, 960],
    photoAlt: "Green Glow in a stemless glass at the Matcha 9 bar",
    toast: "item-green-glow_7b4d996b-09e6-49fe-a9a7-c7d875c9ca15",
  },
  {
    slug: "coco-chill",
    name: "Coco Chill",
    price: 6,
    categoryId: "classic",
    tagline: "Matcha over coconut water. Light and refreshing.",
    description:
      "Bright, freshly whisked matcha floated over chilled coconut water and ice. Light and refreshing by design, for the afternoons that call for something clean.",
    components: ["Coconut Water", "Matcha", "Light & Refreshing"],
    product: [720, 720],
    productAlt: "Coco Chill: bright green matcha floating over coconut water",
    photo: [625, 833],
    photoAlt: "Coco Chill in a tall textured glass at the Matcha 9 bar",
    toast: "item-coco-chill_875e0775-9fe1-4af2-8c9c-b396c9e5ecae",
  },
  {
    slug: "pistachio-drip",
    name: "Pistachio Drip",
    price: 7,
    categoryId: "signature",
    tagline: "Pistachio, matcha and a roasted pistachio finish.",
    description:
      "Pistachio cream drips down the glass through layers of matcha, finished with roasted pistachio scattered over the foam.",
    components: ["Pistachio", "Matcha", "Roasted Pistachio Finish"],
    product: [720, 720],
    productAlt: "Pistachio Drip: pistachio cream and matcha topped with crushed pistachio",
    photo: [720, 959],
    photoAlt: "Pistachio Drip with a roasted pistachio finish at the Matcha 9 bar",
    toast: "item-pistachio-drip_cff51c86-9996-432e-935a-559e7882d5ca",
    featured: true,
  },
  {
    slug: "mango-magic",
    name: "Mango Magic",
    price: 6,
    categoryId: "signature",
    tagline: "Mango and matcha under a tropical cream finish.",
    description:
      "Mango and deep green matcha in a tall glass, finished with a soft tropical cream top.",
    components: ["Mango", "Matcha", "Tropical Cream Finish"],
    product: [720, 720],
    productAlt: "Mango Magic: tropical cream top over mango and matcha",
    photo: [720, 960],
    photoAlt: "Mango Magic with a tropical cream finish at the Matcha 9 bar",
    toast: "item-mango-magic_8d2f331c-aaff-4316-a42a-f3b3297a6255",
  },
  {
    slug: "cinnamon-matcha-melt",
    name: "Cinnamon Matcha Melt",
    price: 6,
    categoryId: "signature",
    tagline: "Horchata and matcha with a cinnamon finish.",
    description:
      "Creamy horchata over freshly whisked matcha, finished with a dusting of cinnamon. Comfort in a glass.",
    components: ["Horchata", "Matcha", "Cinnamon Finish"],
    product: [720, 720],
    productAlt: "Cinnamon Matcha Melt: horchata foam dusted with cinnamon over matcha",
    photo: [720, 961],
    photoAlt: "Cinnamon Matcha Melt in a stemless glass at the Matcha 9 bar",
    toast: "item-cinnamon-matcha-melt_48c26285-2c91-4c5d-92e3-01509b97a154",
  },
  {
    slug: "cookie-crave",
    name: "Cookie Crave",
    price: 7,
    categoryId: "indulgent",
    tagline: "Cookies and cream, the matcha way.",
    description:
      "Oreo, milk and matcha under swirls of chocolate cream, in a chocolate-rimmed glass with a cocoa-dusted top.",
    components: ["Oreo", "Milk", "Matcha", "Chocolate Cream"],
    product: [777, 720],
    productAlt: "Cookie Crave: chocolate cream, Oreo and matcha layers",
    photo: [720, 960],
    photoAlt: "Cookie Crave in a chocolate-rimmed glass at the Matcha 9 bar",
    toast: "item-cookie-crave_79800564-297a-4458-bfe4-3fa869c73ca4",
  },
  {
    slug: "matchamisu",
    name: "Matchamisu",
    price: 7,
    categoryId: "indulgent",
    tagline: "Tiramisu, reimagined in matcha.",
    description:
      "Layers of matcha and milk under a tiramisu cream crown, finished with a dusting of matcha.",
    components: ["Milk", "Matcha", "Tiramisu Cream", "Matcha Dust"],
    product: [720, 721],
    productAlt: "Matchamisu: tiramisu cream crown dusted with matcha over layered matcha",
    photo: [720, 960],
    photoAlt: "Matchamisu with matcha dust at the Matcha 9 bar",
    toast: "item-matchamisu_acfe2f5c-1beb-4721-90c0-49c8743ec101",
  },
];

/** When the starting menu was written; stands in for "last updated" before any edit. */
const SEEDED_AT = "2026-09-29T12:00:00.000Z";

export const starterCategories: Category[] = categories.map((c, sort) => ({ ...c, sort }));

/** The starting menu as menu items. Ids are the slugs, which is what the static preview uses. */
export function starterItems(): MenuItem[] {
  return items.map((item, sort) => ({
    id: item.slug,
    slug: item.slug,
    name: item.name,
    priceCents: Math.round(item.price * 100),
    categoryId: item.categoryId,
    badge: item.badge ?? null,
    tagline: item.tagline,
    description: item.description,
    components: item.components,
    ingredients: item.ingredients ?? null,
    options: item.options ?? [],
    productImage: {
      src: `/images/drinks/product/${item.slug}.webp`,
      width: item.product[0],
      height: item.product[1],
    },
    productImageAlt: item.productAlt,
    photoImage: {
      src: `/images/drinks/bar/${item.slug}.webp`,
      width: item.photo[0],
      height: item.photo[1],
    },
    photoImageAlt: item.photoAlt,
    toastUrl: toastBase + item.toast,
    toastGuid: item.toast.split("_").at(-1) ?? null,
    isVisible: true,
    inStock: true,
    featured: item.featured ?? false,
    sort,
    updatedAt: SEEDED_AT,
  }));
}

/** The menu photography that ships with the site, for the dashboard's image picker. */
export function builtInImages(): LibraryImage[] {
  return items.flatMap((item) => [
    {
      src: `/images/drinks/product/${item.slug}.webp`,
      width: item.product[0],
      height: item.product[1],
      label: `${item.name} · studio`,
    },
    {
      src: `/images/drinks/bar/${item.slug}.webp`,
      width: item.photo[0],
      height: item.photo[1],
      label: `${item.name} · at the bar`,
    },
  ]);
}
