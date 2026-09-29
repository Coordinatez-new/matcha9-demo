/**
 * Brand story, verbatim from the printed card handed out at the Matcha 9 counter
 * ("From Rooted Wisdom to Pure Energy", signed by founder Nick Patel).
 */
export const storyTitle = "From Rooted Wisdom to Pure Energy";

export const founder = { name: "Nick Patel", role: "Founder" };

export type StoryChapter = { id: string; title: string; paragraphs: string[] };

export const chapters: StoryChapter[] = [
  {
    id: "the-search",
    title: "The Search for a Better Boost",
    paragraphs: [
      "Back between 2008 and 2011, energy drink culture was everywhere. Supermarket shelves were lined with synthetic energy shots, high-sugar mixers, and high-caffeine cans promising quick performance. But that quick fix came with a cost: sudden spikes, jittery hands, and the inevitable mid-afternoon crash.",
      "Growing up in a home deeply rooted in natural health, organic living, and Ayurvedic principles, I knew there had to be a better way to fuel our bodies. Our philosophy was simple: what you put into your body should nourish it for life, not just for the next hour.",
      "Driven by this mission to help people stay healthy and energized, I launched my own Berry Boost Energy concept in 2013 as a natural alternative. Drawing on years of experience experimenting with natural antioxidants, I blended vibrant berries and botanicals like guarana root to deliver sustained, crash-free energy.",
      "When it comes to energy, not all sources are created equal. Synthetic energy drinks and shots are highly processed, packed with sugar, and can be tough on your body. Coffee is a step up, but it can still leave you feeling anxious, acidic, or crashing later on. Standard teas are a gentler option with plenty of antioxidants, but they may not always give you the boost you need to keep up with a busy day. Natural berry energy offers a cleaner, plant-based way to feel energized while working more naturally with your body’s rhythm.",
    ],
  },
  {
    id: "the-discovery",
    title: "The Discovery of Ultimate Vitality",
    paragraphs: [
      "As my journey in natural wellness evolved, one superfood that consistently stood out above everything else was Matcha. Matcha isn’t just energy; it is comprehensive cellular nutrition. It is rich in L-theanine, dense in antioxidants (including powerful EGCG), and packed with vital minerals, and delivers a smooth, calm alertness without a single jitter. Matcha supports metabolic health, boosts focus, aids cellular defense, and promotes long-term vitality. As global awareness around matcha grew, my team and I knew it was time to bring something truly exceptional to the market. That was the birth of Matcha 9.",
    ],
  },
  {
    id: "the-quest",
    title: "The Quest for Perfection",
    paragraphs: [
      "We didn’t want to launch just another green tea brand. For over a year and a half, our team traveled, sampled, and vetted matcha varieties from elite growers across the world. Our quest ended in the pristine, nutrient-dense tea fields of Japan, where we secured a source of pure, certified organic matcha that met our uncompromising standards for color, aroma, texture, and potency.",
    ],
  },
  {
    id: "our-promise",
    title: "Our Promise to You",
    paragraphs: [
      "Matcha 9 is all about keeping things simple, honest, and delicious. Our flagship matcha is pure and unfiltered, with zero additives, fillers, or added sugar. Just pure, organic Japanese ceremonial-grade matcha, exactly the way it’s meant to be. To make daily wellness delicious, we are introducing targeted flavor blends. These pair the natural power of our Japanese matcha with crave-worthy natural flavors, so you get all the health benefits in a drink you genuinely look forward to enjoying every day. We created Matcha 9 so you never have to sacrifice your long-term health for daily energy.",
    ],
  },
];

export const signOff = {
  line: "Welcome to clean, elevated vitality.",
  closing: "Fondly,",
};

export const pullQuotes = {
  philosophy: "What you put into your body should nourish it for life, not just for the next hour.",
  matcha: "Matcha isn’t just energy; it is comprehensive cellular nutrition.",
  quest: "We didn’t want to launch just another green tea brand.",
  promise:
    "We created Matcha 9 so you never have to sacrifice your long-term health for daily energy.",
};

export const timeline = [
  {
    when: "2008–2011",
    what: "Energy-drink culture is everywhere: spikes, jitters and the mid-afternoon crash.",
  },
  {
    when: "2013",
    what: "Nick launches Berry Boost Energy, berries and botanicals for crash-free energy.",
  },
  {
    when: "18 months",
    what: "The team travels, tastes and vets matcha from growers around the world.",
  },
  { when: "09.09.2026", what: "Matcha 9 opens its doors in Logan Square with “Matcha 9 & Chill”." },
];
