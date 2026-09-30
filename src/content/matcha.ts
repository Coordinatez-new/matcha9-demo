/**
 * "About matcha" copy from the Matcha 9 QR ingredient pages
 * ("The part most places don't bother explaining."). Verbatim except that the gram
 * figure is left out: the client's pages say both 3 g and 4 g, so it waits for confirmation.
 */
export type Faq = { q: string; a: string[] };

export const aboutMatcha: Faq[] = [
  {
    q: "What matcha actually is",
    a: [
      "Green tea leaves, shaded from the sun for a few weeks before picking, then steamed, dried and stone-ground into powder.",
      "With regular tea you steep the leaf and throw it away. With matcha you drink the leaf itself, which is why the colour and the flavour are so much stronger.",
    ],
  },
  {
    q: "Why the shade matters",
    a: [
      "Covering the plants slows it down and pushes it to make more chlorophyll and more L-theanine.",
      "That’s where the deep green comes from, and the sweet, savoury note underneath. Unshaded leaf makes a duller, sharper tea.",
    ],
  },
  {
    q: "First harvest",
    a: [
      "Ours is ichibancha, the first spring picking. Youngest leaves, softest texture, naturally sweeter.",
      "Later harvests are coarser and more bitter, which is why they usually end up hidden behind sugar. Ours doesn’t need to be.",
    ],
  },
  {
    q: "Why we whisk it",
    a: [
      "Matcha doesn’t dissolve. It stays suspended in the liquid, so it has to be broken up properly or it goes gritty.",
      "Every drink starts with matcha whisked into hot water with a bamboo chasen before anything else goes in the glass. Hot but not boiling: boiling water scorches it and turns it bitter.",
    ],
  },
  {
    q: "Caffeine, and why it feels different",
    a: [
      "A cup lands at roughly 90–120 mg of caffeine, close to a cup of coffee. We don’t do a small pour.",
      "Matcha also carries L-theanine, which is why a lot of people find it steadier than coffee even at the same strength. If you’re watching your caffeine, say so and we’ll build it lighter.",
    ],
  },
  {
    q: "Give it a stir",
    a: [
      "We build these in layers, so the first sip and the last one aren’t the same drink.",
      "Look at it, take a photo, then stir it properly before you get going.",
    ],
  },
];

/** The brand's own quality claims (brand-story card and QR pages). */
export const standards = [
  {
    title: "Certified organic",
    body: "Sourced from the tea fields of Japan and certified organic.",
  },
  {
    title: "Ceremonial grade",
    body: "Pure Japanese ceremonial-grade matcha, exactly the way it’s meant to be.",
  },
  {
    title: "First harvest",
    body: "Ichibancha, the first spring picking: youngest leaves, naturally sweeter.",
  },
  {
    title: "Nothing added",
    body: "Our flagship has zero additives, zero fillers and no added sugar.",
  },
];

/** The tools on the Matcha 9 counter (seen in the bar photos). */
export const tools = [
  {
    name: "Chasen",
    jp: "茶筅",
    body: "The bamboo whisk. Its fine tines break the matcha up so it suspends smoothly instead of going gritty.",
  },
  {
    name: "Katakuchi",
    jp: "片口",
    body: "The spouted stoneware bowl every drink is whisked in, then poured from.",
  },
  {
    name: "Chashaku",
    jp: "茶杓",
    body: "A slim scoop for measuring the matcha before it meets the water.",
  },
  { name: "Sifter", jp: "篩", body: "A fine mesh that breaks up clumps before whisking." },
  {
    name: "Kettle",
    jp: "湯沸かし",
    body: "A gooseneck kettle for a steady pour of hot, never boiling, water.",
  },
];
